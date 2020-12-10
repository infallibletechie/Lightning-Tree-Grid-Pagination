import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchAccounts from '@salesforce/apex/PaginationController.fetchAccounts';

const PAGE_SIZE = 5;

export default class Pagination extends NavigationMixin( LightningElement ) {

    gridColumns = [{
        type: 'text',
        fieldName: 'Name',
        label: 'Name'
    },
    {
        type: 'text',
        fieldName: 'Industry',
        label: 'Industry'
    },
    {
        type: 'text',
        fieldName: 'FirstName',
        label: 'FirstName'
    },
    {
        type: 'text',
        fieldName: 'LastName',
        label: 'LastName'
    },
    {
        type: 'button',
        typeAttributes: {
            label: 'View'
        }
    }];
    gridData;
    initalRecords;
    frstBool = false;
    lastBool = false;
    nextBool = false;
    prevBool = false;
    offset = 0;
    pageSize = PAGE_SIZE;
    dataCount = 0;

    /*
        Wire method fetch Account records
    */
    @wire(fetchAccounts)
    accountTreeData( { error, data } ) {

        if ( data ) {

            let tempData = JSON.parse( JSON.stringify( data ) );
            console.log( 'Data is ' + JSON.stringify( tempData ) );
            /*let tempjson = JSON.parse( JSON.stringify( data ).split( 'Contacts' ).join( '_children' ) );
            console.log( 'Temp JSON is ' + tempjson );*/
            for ( let i = 0; i < tempData.length; i++ ) {

                tempData[ i ]._children = tempData[ i ][ 'Contacts' ];
                delete tempData[ i ].Contacts;

            }
            this.initalRecords = tempData;

        } else if ( error ) {
         
            if ( Array.isArray( error.body ) )
                console.error( 'Error is ' + error.body.map( e => e.message ).join( ', ' ) );
            else if ( typeof error.body.message === 'string' )
                console.error( 'Error is ' + error.body.message );

        }

        if ( this.initalRecords ) {

            this.dataCount = this.initalRecords.length;

            if ( this.dataCount > this.pageSize ) {

                this.nextBool = true;
                this.lastBool = true;

            }

            console.log( 'Count is ' + this.dataCount );
            this.fetchData();

        } 

    }

    /*
        Method to expand all Account records to display related Contact records
    */
    expandAll() {

        const grid =  this.template.querySelector( 'lightning-tree-grid' );
        grid.expandAll();
    
    }
    /*
        Method to collapse all Account records to hide related Contact records
    */
    collapseAll() {

        const grid =  this.template.querySelector( 'lightning-tree-grid' );
        grid.collapseAll();
     
    }

    /*
        Method to handle when View button is clicked
    */
    handleRowAction( event ) {
       
        const row = event.detail.row;
        console.log( 'Row is ' + JSON.stringify( row ) );
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                actionName: 'view'
            }
        });

    }

    /*
        Method to navigate to previous set of Account records
    */
    goPrevious() {

        this.offset -= this.pageSize;
        this.nextBool = true;

        if( this.offset === 0 ) {

            this.prevBool = false;
            this.frstBool = false;

        } else {

            this.nextBool = true;
            this.lastBool = true;            

        }
        
        this.fetchData();

    }

    /*
        Method to navigate to next set of Account records
    */
    goNext() {

        this.offset += this.pageSize;
        this.prevBool = true;

        if ( ( this.offset + this.pageSize ) >= this.dataCount ) {

            this.nextBool = false;
            this.lastBool = false;

        } else {

            this.prevBool = true;
            this.frstBool = true;

        }
        
        this.fetchData();

    }

    /*
        Method to navigate to first set of Account records
    */
    goFirst() {

        this.offset = 0;
        this.nextBool = true;
        this.prevBool = false;
        this.frstBool = false;
        this.lastBool = true;
        this.fetchData();

    }

    /*
        Method to nanigate to last set of Account records
    */
    goLast() {

        this.offset = this.dataCount - ( this.dataCount % this.pageSize );
        this.nextBool = false;
        this.prevBool = true;
        this.frstBool = true;
        this.lastBool = false;
        this.fetchData();

    }

    /*
        Method to fetch the data from the original list of records.
        slice() is used to get the right set of records based on page size and offset values.
    */
    fetchData() {

        this.gridData = this.initalRecords.slice( this.offset, ( this.offset + this.pageSize ) );
        console.log( this.gridData.length + ' - ' + JSON.stringify( this.gridData ) );
        
    }

}