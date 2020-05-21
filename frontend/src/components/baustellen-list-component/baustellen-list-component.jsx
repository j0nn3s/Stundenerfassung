import React from 'react';
import './baustellen-list-component.css'
import {BaustellenCard} from '../baustellen-card-component/baustellen-card-component'

export const BaustellenList = (props) => {

return <div className='baustellen-list'>
    {props.baustellen.map(einzelnebaustelle => <BaustellenCard key={einzelnebaustelle.id + '-card'} baustelle={einzelnebaustelle}/>)}
    </div>
}