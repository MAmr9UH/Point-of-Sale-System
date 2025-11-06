import MenuPanel from '../components/MenuPanel';
import SalePanel from '../components/SalePanel';
import './Menu.css';
const Menu =  () => {

    return (
        <div className="menu-page">
            <div className="menu">
                <MenuPanel />
                <SalePanel />
            </div>
        </div>
    );
};

export default Menu;