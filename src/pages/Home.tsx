import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import './Home.css';
import MainScreen from '../components/MainScreen';



const Home: React.FC = () => {
  return (
    <IonPage>
      <MainScreen />
    </IonPage>
  );
};

export default Home;
