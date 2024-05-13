import './MainLocationCard.css';
export default MainLocationCard;

function MainLocationCard({ lat, long, date, streetName, imageURL}: { lat: string, long: string, date: string, streetName: string,  imageURL: string }) {
    
    const googleMapsUrl = `https://maps.google.com?q=${lat},${long}`;

    return(
        <a href={googleMapsUrl}>
            <div className='mainLocationCardContainer'>
                <div className='mainLocationCardMapImgGradient'>
                    <img className='mainLocationCardMapImg' src={imageURL}/>
                </div>
                <div className='mainLocationCardInfoContainer'>
                    <div className='separator' />
                    {streetName === "" && <p className='streetNameText'>{lat + "," + long}</p>}
                    {streetName != "" && <p className='streetNameText'>{streetName}</p>}
                    <p className='dateText'>{date}</p>    
                </div>
            </div>
        </a>
    )
}