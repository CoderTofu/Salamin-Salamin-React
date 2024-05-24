import '../css/landing.css';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/home');
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                handlePlayClick();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []); 

    return (
        <div className="landing-container">
            <div className="content-wrapper">
                <img src="/images/salamin-landing-logo.png" alt="Center" className="center-logo" />
                <button className="play-button" onClick={handlePlayClick}>PRESS ENTER TO PLAY</button>
            </div>
        </div>
    );
}

export default Landing;
