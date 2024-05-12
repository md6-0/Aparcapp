import './SubLocationCard.css';
export default SubLocationCard;

function SubLocationCard({ lat, long, date, streetName, imageURL}: { lat: string, long: string, date: string, streetName: string,  imageURL: string }) {
    
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`+ "&travelmode=walking";

    return(
        <a href={googleMapsUrl}>
            <div className='sublocationCardContainer'>
                <div className='sublocationCardMapImgGradient'>
                    <img className='sublocationCardMapImg' src={imageURL}/>
                </div>
                <div className='sublocationCardInfoContainer'>
                    <div className='separator' />
                    {streetName === "" && <p className='streetNameText'>{lat + "," + long}</p>}
                    {streetName != "" && <p className='streetNameText'>{streetName}</p>}
                    <p className='dateText'>{date}</p>    
                </div>
            </div>
        </a>
    )
}