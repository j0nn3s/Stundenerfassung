import React from 'react';
import './baustellen-card-component.css'
import './../../designs/bootstrap-4.4.1-dist/css/bootstrap.min.css'
import './../../designs/bootstrap-4.4.1-dist/css/bootstrap-grid.min.css'

export const BaustellenCardRow = (props) => {
    return <div key={props.keyValue}className='row'>
                <div className='col-4 left-text-align'>
                    <label>{props.keyValue}</label>
                </div>
                <div className='col-8 left-text-align'>
                    <label>{props.labelValue}</label>
                </div>
            </div>
}