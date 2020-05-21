import React from 'react';
import './search-row-component.css'
import './../../designs/bootstrap-4.4.1-dist/css/bootstrap.min.css'
import './../../designs/bootstrap-4.4.1-dist/css/bootstrap-grid.min.css'

export const SearchBar = ({handleChange}) => {

    return <div className='row searchRow'>
        <div className='col-2'>
        </div>
        <div className='col-4'>
            <input key='baustellenNameSearch' onChange={handleChange} placeholder='Name, Ort, plz'/>
        </div>
        <div className='col-4'>
            <div className='row'>
                <div className='2'>
                    <label className="filterLabel">von:</label>
                </div>
                <div className='col-4'>
                    <input key='baustellenDateFromSearch' onChange={e => console.log(e.target.value)/*this.setState({baustellenSucheDateVon: e.target.value})*/} type='date'/>
                </div>
                <div className='2'>
                    <label className="filterLabel">bis:</label>
                </div>
                <div className='col-4'>
                    <input key='baustellenDateFromSearch' onChange={console.log('test')} type='date'/>
                </div>
            </div>
        </div>
        <div className='col-2'>
        </div>
    </div>
}