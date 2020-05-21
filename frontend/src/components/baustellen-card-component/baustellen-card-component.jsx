import React from 'react';
import {BaustellenCardRow} from './baustellen-card-row-component'

import './baustellen-card-component.css'
import './../../designs/bootstrap-4.4.1-dist/css/bootstrap.min.css'
import './../../designs/bootstrap-4.4.1-dist/css/bootstrap-grid.min.css'

export const BaustellenCard = (props) => {
    return <div key={props.baustelle.id} className='baustellen-card'>{
            <div>
                <h1>{props.baustelle.name}</h1>
                <div className='row'>
                    <div className='col-4 left-text-align'>
                        <label>Ort:</label>
                    </div>
                    <div className='col-8 left-text-align'>
                        <label>{props.baustelle.ort}</label>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-4 left-text-align'>
                        <label>plz:</label>
                    </div>
                    <div className='col-8 left-text-align'>
                        <label>{props.baustelle.plz}</label>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-4 left-text-align'>
                        <label>strasse:</label>
                    </div>
                    <div className='col-8 left-text-align'>
                        <label>{props.baustelle.strasse}</label>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-4 left-text-align'>
                        <label>bemerkungen:</label>
                    </div>
                    <div className='col-8 left-text-align'>
                        <label>{props.baustelle.bemerkungen}</label>
                    </div>
                </div>
            </div>
            }
        </div>;
}