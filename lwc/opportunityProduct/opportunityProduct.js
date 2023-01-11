import { LightningElement, api} from 'lwc';
import getOpportunityProductList from '@salesforce/apex/OpportunityProductController.getOpportunityProductList';
import toSaved from '@salesforce/apex/OpportunityProductController.toSaved';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label : 'Name', fieldName : 'Name', type : 'text', editable : 'true'},
    { label : 'Phone', fieldName : 'Phone__c', type : 'text' },
    { label : 'Balance', fieldName : 'Balance__c', type : 'Number' },
    { label : 'Type', fieldName : 'Type__c', type : 'text' }
]

export default class OpportunityProduct extends LightningElement 
{
    @api recordId;
    data = [];
    columns = COLUMNS;
    pageSizeOptions = [5, 10, 25, 50, 75, 100];
    totalRecords = 0; 
    pageSize; 
    totalPages; 
    pageNumber = 1;   
    paginationFlag = false; 
    records = []
    createRecordForm = false;
    draftvalues = []
    noRecordFlag;
    uniqueRecord = [];

    //on click of add button
    customShowModalPopup() 
    {
        this.createRecordForm = true;
    }
    
    //On click of cancel button in modal popup
    handleCancel() 
    {
        this.createRecordForm = false;
    }

    //On click of add button in modal popup
    handleAdd(event)
    {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        const details = {Name : fields.Name, 
                         Phone__c : fields.Phone__c, 
                         Balance__c : fields.Balance__c, 
                         Type__c : fields.Type__c, 
                         Opportunity__c : this.recordId};
        this.createRecordForm = false;
        this.records.push(details);
        this.totalRecords += 1;
        this.records.length > 0 ? this.noRecordFlag = false : this.noRecordFlag = true;
        this.records.length > 5 ? this.paginationFlag = true : this.paginationFlag = false;
        this.paginationHelper();
    }
    
    //On clicking of cancel button
    onCancel()
    {
        this.getData();
    }

    connectedCallback()
    {
        this.getData();
    }

    //function to get opportunity product list related to opportunity
    getData()
    {
        getOpportunityProductList({recordId : this.recordId})
            .then(result => 
            {
                this.savedData = result;
                this.data = result;
                this.records = result;
                this.totalRecords = result.length;              
                this.pageSize = this.pageSizeOptions[0];
                this.paginationHelper();   
                this.records.length === 0 ? this.noRecordFlag = true : this.noRecordFlag = false;
                this.records.length > 5 ? this.paginationFlag = true : this.paginationFlag = false;
            })
            .catch(error => 
            {
                console.log(JSON.stringify( error));
            });
    }

    //to handle records per page
    handleRecordsPerPage(event) 
    {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }

    //set records to display on current page 
    paginationHelper() 
    {
        this.data = [];
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageNumber <= 1) 
        {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) 
        {
            this.pageNumber = this.totalPages;
        }
        for (let count = (this.pageNumber - 1) * this.pageSize; count < this.pageNumber * this.pageSize; count++) 
        {
            if (count === this.totalRecords) 
            {
                break;
            }
            this.data.push(this.records[count]);
        }
    }

    get bDisableFirst() 
    {
        return this.pageNumber === 1;
    }

    get bDisableLast() 
    {
        return this.pageNumber === this.totalPages;
    }

    //Go to previous page
    previousPage() 
    {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }

    //Move to next page
    nextPage() 
    {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }

    //Move to first page
    firstPage() 
    {
        this.pageNumber = 1;
        this.paginationHelper();
    }

    //Move to last page
    lastPage() 
    {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }

    //check for duplicate names
    checkForDuplicateNames(data) 
    {
        const uniqueNames = new Set();
        const duplicateNames = [];
        data.forEach(element => {
        if (uniqueNames.has(element.Name)) 
        {
            duplicateNames.push(element.Name);
        } else {
            uniqueNames.add(element.Name);
            this.uniqueRecord.push(element);
            }
         });
        duplicateNames.forEach(element => {
            this.uniqueRecord = this.uniqueRecord.filter(item => item.Name !== element)
        });
        return duplicateNames;
    }

    //toast message function
    showToast(title, message, variant) 
    {
        const event = new ShowToastEvent({
            title : title,
            message : message,
            variant : variant
        });
        this.dispatchEvent(event);
    }

    //On clicking save button
    handleSaveButtonClick(event) 
    {
        const updatedValue = this.template.querySelector('lightning-datatable').draftValues;
        
        for( let key in this.records )
        {
            updatedValue.forEach(element => {
                if((element.id).split('-')[1] == key)
                {
                    this.records[key].Name = element.Name;
                }
            });
        }
        const duplicateNames = this.checkForDuplicateNames(this.records);
        if (duplicateNames.length > 0) 
        {
            this.showToast('Duplicate Names Found', `Duplicate names found: ${duplicateNames.join(', ')}`, 'warning');
            this.getData();
        } 
        if(this.uniqueRecord.length > 0)
        {
            toSaved({toInsert : this.uniqueRecord})
                .then(result => 
                {
                    this.showToast('Success', 'Records added Successfully!!', 'success');
                    this.uniqueRecord = [];
                    this.getData();
                })
                .catch(error => 
                {
                    console.log(JSON.stringify(error));
                });
        }
        
    }
}
