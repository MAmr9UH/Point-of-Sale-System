import { useEffect, useState } from 'react';
import MenuItem from './MenuItem';
import './MenuPanel.css';
import * as fetchMenuUtils from '../utils/fetchMenu';

const MenuPanel = () => {
    
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        fetchMenuUtils.fetchMenuEm().then(items => {
            setMenuItems(items);
        });
    }, []);

    return (
        <div id="menu-panel">
            <div id="menu-grid">
                {menuItems.map(item => <MenuItem key={item.id} item={item} />)}
            </div>
        </div>
    );
};

export default MenuPanel;