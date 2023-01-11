public with sharing class OpportunityProductController 
{
    //get related opportunity product record
    @AuraEnabled
    public static List<Opportunity_Product__c> getOpportunityProductList(Id recordId)
    {
        List<Opportunity_Product__c> opportunityProductList = [SELECT Id, Name, Phone__c, Balance__c, Type__c 
                                                               FROM Opportunity_Product__c 
                                                               WHERE Opportunity__c = :recordId];
        return opportunityProductList;                                            
    }

    //to update and insert the records
    @AuraEnabled
    public static void toSaved(List<Opportunity_Product__c> toInsert)
    {
        UPSERT toInsert;
    }
}
