import { IonPage} from '@ionic/react';
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
