import React, { useState, useEffect } from 'react';
import MainLocationCard from './MainLocationCard';
import { Geolocation } from '@capacitor/geolocation';
import { IonButton, IonSpinner } from '@ionic/react';
import { IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList } from '@ionic/react';
import { Storage } from '@ionic/storage';
import { Toast } from '@capacitor/toast';
import './MainScreen.css';
import SubLocationCard from './SubLocationCard';

// Interfaz para los objetos que se guardarán en el almacenamiento
interface Coordinates {
    Key: string,
    Lat: string;
    Long: string;
    DateTime: string; 
    StreetName: string;
    ImgURL: string;
}
const store = new Storage();
store.create();

function MainScreen() {

    // Se ejecuta sólo al inicializar. Obtenemos la mainLocation y las oldLocations.
    useEffect(() => {
        getMainLocation();
        getOldLocations();
    }, []);

    // Se crea un State para poder actualizar la MainLocation
    const [mainLocation, setMainLocation] = useState<Coordinates | null>(null);
    // Se crea un State para poder actualizar las oldLocations
    const [oldLocations, setLocations] = useState<Coordinates[]>([]);
    // Se crea un State para poder actualizar el estado del spinner
    const [showSpinner, setShowSpinner] = useState(false);

    //Función para obtener la úlitma key guardada
    async function getLastAddedKey() {

        // Se obtienen todas las claves y se almacenan en un array de números.
        const keys = await store.keys();
        let orderedKeys :number[] = [];
        keys.forEach((value) => {
            orderedKeys.push(parseInt(value));
        })
        // Se ordena el array de menor a mayor
        orderedKeys.sort((n1,n2) => n1 - n2);        
        
        // Si el array es vacio, no hay locations.
        // Si está lleno, se obtiene el último item, ya que será la mainLocation porque es el último que se añadió.
        let lastKeyAdded: number;        
        if(keys.length > 0){
            lastKeyAdded = orderedKeys[orderedKeys.length - 1]
        }else{
            lastKeyAdded = 0;
        }
  
        return lastKeyAdded;
    }

    // Función para eliminar del almacenmiento dada una key
    async function deleteFromStore(key: string) {
        // Se elimina del almacenamiento y se actualiza la lista de oldLocations
        await store.remove(key);
        await getOldLocations();
    }

    //Función para obtener la última location guardada, que será la MainLocation.
    async function getMainLocation() {
 
        try {
            // Se obtiene la MainLocation
            const lastAddedKey = await getLastAddedKey();
            const coords = await store.get(lastAddedKey.toString());

            //Si no hay MainLocation, seteamos a null.
            //Si hay MainLocation, la guardamos en el State mainLocation
            if (coords === null) {
                setMainLocation(null);
            } else {
                const location: Coordinates = JSON.parse(coords);
                setMainLocation(location);
            }
        } catch (error) {
            console.error("Error al obtener la ubicación principal:", error);
        }
    }

    // Función para obtener las oldLocations (todas menos la mainLocation)
    async function getOldLocations() {
        try {
            // Se obtienen las claves, se guardan en un array de números y se ordenan de mayor a menor
            const keys = await store.keys();
            const orderedKeys = keys.map(value => parseInt(value)).sort((n1, n2) => n2 - n1);
            const locations = [];
            for (const value of orderedKeys) {
                const coords = await store.get(value.toString());
                locations.push(JSON.parse(coords));
            }
            // Se elimina el primer item del array, que será la mainLocation porque es la última en haber sido añadida
            locations.shift()            
            // Se actualiza la lista de oldLocations mediante el state.
            setLocations(locations);
        } catch (error) {
            console.error('Error al obtener las ubicaciones:', error);
        }
    }
    

    // Función para obtener el nombre de la calle mediante las coordenadas gps.
    async function getStreetNameByCoords(lat: string, lon: string) {
        try {
            // Se hace la petición a openCageData para obtener el nombre de la calle
            let streetName: string;
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lon}&key=a65dba87c0584f8b907f8758e6b4461b&language=es&no_annotations=1&pretty=1`);
            const data = await response.json();
            streetName = data.results[0].components.road;
            // Si la respuesta trae el número de la calle, se concatena al nombre de la calle
            if(data.results[0].components.house_number!=undefined){streetName = streetName + ", " + data.results[0].components.house_number }
            // Se pone la primera letra del nombre de la calle a mayúscula
            streetName = streetName.charAt(0).toUpperCase() + streetName.slice(1);
            //Si el nombre de la calle es muy largo, se hace una elipsis
            streetName = streetName.length > 40 ? streetName.substring(0, 38  ) + '...' : streetName;
            return streetName;
        } catch (error) {
            return ""; 
        }
    }

    //Función para obtener la localización al darle al botón "Guardar aparcamiento"
    async function getAndSetGPS() {

        try {
            setShowSpinner(true);
            //Obtenemos la última key guardada
            const lastAddedKey = await getLastAddedKey();
            const keyToAdd = (lastAddedKey + 1).toString()

            //Obtenemos las coordenadas GPS y el nombre de la calle
            const position = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
            const streetName = await getStreetNameByCoords(position.coords.latitude.toString(), position.coords.longitude.toString());
            // Formateamos la fecha y hora actual
            const currentDateTime = formatDateTime(new Date()); 
            //Creamos un objeto para guardar la información de la location.
            const coords: Coordinates = {
                Key: keyToAdd,
                Lat: position.coords.latitude.toString(),
                Long: position.coords.longitude.toString(),
                DateTime: currentDateTime,
                StreetName: streetName,
                ImgURL: "https://staticmapmaker.com/img/google-placeholder.png"
            };
            //Guardamos el objeto en almacenamiento
            await store.set(keyToAdd, JSON.stringify(coords));
            //Obtenemos las locations para actulizar la pantalla
            await getMainLocation();
            await getOldLocations();
            setShowSpinner(false);
            await Toast.show({
                text: '¡Aparcamiento guardado!'
            });
            } catch (error) {
                setShowSpinner(false);
                await Toast.show({
                    text: 'Error al obtener las coordenadas. Asegúrese de encender la ubicación.',
                    duration: 'long'
                });
                
            }
    }

    // Función para formatear la fecha a "DD/MM/YYYY HH:MM:SS"
    function formatDateTime(dateTime: Date): string {
        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const seconds = String(dateTime.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

   
    return (
        <div className='mainContainer'>
            <section className='mainLocationContainer'>
                <div className='mainLocationContainerTitle'>
                    <h1>Último aparcamiento</h1>
                </div>
                {mainLocation && <MainLocationCard lat={mainLocation.Lat} long={mainLocation.Long} date={mainLocation.DateTime} streetName={mainLocation.StreetName} imageURL={mainLocation.ImgURL} />}
            </section>

            <div className='subLocationContainerTitle'>
                <h3>Aparcamientos anteriores</h3>
            </div>

            <section className='locationsContainer'>
                <div>
                    <IonList >
                        {oldLocations.map((oldLocation, index) => (
                            <IonItemSliding key={index} className='margin-bottom-1halfrem'>  
                                <IonItem>
                                    <SubLocationCard key={oldLocation.Key} lat={oldLocation.Lat} long={oldLocation.Long} date={oldLocation.DateTime} streetName={oldLocation.StreetName} imageURL={oldLocation.ImgURL} />
                                </IonItem> 
                                <IonItemOptions>
                                    <IonItemOption className="customIonOption" color="danger" onClick={() => {deleteFromStore((oldLocation.Key).toString());}}> Eliminar </IonItemOption>
                                </IonItemOptions>
                            </IonItemSliding>
                        ))}
                    </IonList>
                </div>
            </section>
            <IonButton className={showSpinner ? 'saveBtn saveBtnDisabled' : 'saveBtn'} disabled={showSpinner} onClick={getAndSetGPS}>{showSpinner ? 'Guardando aparcamiento...' : 'Guardar aparcamiento'}
            {showSpinner && <IonSpinner className='spinner' name="crescent" />}
            </IonButton>

        </div>
    );
}

export default MainScreen;
