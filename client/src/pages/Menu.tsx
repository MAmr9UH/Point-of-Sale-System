import MenuPanel from '../components/MenuPanel';
import SalePanel from '../components/SalePanel';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

const Menu =  () => {
    const navigate = useNavigate();

    return (
        <div className="menu-page">
            <button 
                className="back-to-dashboard-btn"
                onClick={() => navigate('/employee')}
            >
                ←
            </button>
            <div className="menu">
                <MenuPanel />
                <SalePanel />
            </div>
        </div>
    );
};

export default Menu;
