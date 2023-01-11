@isTest
public with sharing class TestOpportunityProductController 
{
    //to insert opportunity and its related opportunity product record in database
    @TestSetup
    static void createOpportunityProductRelatedOpportunity()
    {
        Opportunity oppFirst = new Opportunity(Name = 'Muskan', 
                                               StageName = 'New', 
                                               CloseDate = Date.newInstance(2004, 11, 6));
        INSERT oppFirst;
        Opportunity oppSecond = new Opportunity(Name = 'Navya', 
                                                StageName = 'closed', 
                                                CloseDate = Date.newInstance(2004, 11, 6));
        INSERT oppSecond;

        List<Opportunity_Product__c> opportunityProductList = new List<Opportunity_Product__c>();                                                                                                                                             
        opportunityProductList.add(new Opportunity_Product__c(Name = 'Harshita', 
                                                              Phone__c = '213687',
                                                              Balance__c = 788.2,
                                                              Type__c = 'a',
                                                              Opportunity__c = oppFirst.Id));
        opportunityProductList.add(new Opportunity_Product__c(Name = 'Manav', 
                                                              Phone__c = '213287',
                                                              Balance__c = 732.2,
                                                              Type__c = 'b',
                                                              Opportunity__c = oppFirst.Id));
        opportunityProductList.add(new Opportunity_Product__c(Name = 'Karishma', 
                                                              Phone__c = '7868690',
                                                              Balance__c = 988.2,
                                                              Type__c = 'b',
                                                              Opportunity__c = oppFirst.Id));
        opportunityProductList.add(new Opportunity_Product__c(Name = 'karan', 
                                                              Phone__c = '213287',
                                                              Balance__c = 732.2,
                                                              Type__c = 'b',
                                                              Opportunity__c = oppSecond.Id));
        opportunityProductList.add(new Opportunity_Product__c(Name = 'Mukund', 
                                                              Phone__c = '7868690',
                                                              Balance__c = 988.2,
                                                              Type__c = 'b',
                                                              Opportunity__c = oppSecond.Id));

        INSERT opportunityProductList;
    }

    //to get the opportunity product related to opportunity
    @isTest
    private static void testOpportunityProductList()
    {
        Id oppFirstId = [SELECT Id FROM Opportunity WHERE Name = 'Muskan'].Id;
        Id oppSecondId = [SELECT Id FROM Opportunity WHERE Name = 'Navya'].Id;

        Test.startTest();
        //number of related opportunity product corresponding to Muskan
        System.assertEquals(3, OpportunityProductController.getOpportunityProductList(oppFirstId).size());
        //number of related opportunity product corresponding to Navya
        System.assertEquals(2, OpportunityProductController.getOpportunityProductList(oppSecondId).size());
        Test.stopTest();
    }

    //to update and insert the record of opportunity product
    @isTest
    private static void testToSaved()
    {
        Id oppFirstId = [SELECT Id FROM Opportunity WHERE Name = 'Muskan'].Id;
        List<Opportunity_Product__c> opportunityProductList = new List<Opportunity_Product__c>();

        opportunityProductList.add(new Opportunity_Product__c(Name = 'Rakesh', 
                                                              Phone__c = '2136832237',
                                                              Balance__c = 788.2,
                                                              Type__c = 'b',
                                                              Opportunity__c = oppFirstId));
        opportunityProductList.add(new Opportunity_Product__c(Name = 'hemang', 
                                                              Phone__c = '2237',
                                                              Balance__c = 18.2,
                                                              Type__c = 'h',
                                                              Opportunity__c = oppFirstId));

        Opportunity_Product__c opportunityProduct = [SELECT Id, NAME 
                                                     FROM Opportunity_Product__c 
                                                     WHERE Name = 'Harshita'
                                                     LIMIT 1];
        opportunityProduct.Name = 'kartik';
        opportunityProductList.add(opportunityProduct);       
        
        List<Opportunity_Product__c> result = [SELECT Id 
                                               FROM Opportunity_Product__c 
                                               WHERE Opportunity__c = :oppFirstId];
        //number of related opportunity product corresponding to Muskan
        System.assertEquals(3, result.size());

        result = [SELECT Id 
                  FROM Opportunity_Product__c 
                  WHERE Name = 'Harshita'];
        //number of related opportunity product where name is Harshita
        System.assertEquals(1, result.size());

        Test.startTest();
        OpportunityProductController.toSaved(opportunityProductList);
        Test.stopTest();

        result = [SELECT Id 
                  FROM Opportunity_Product__c 
                  WHERE Opportunity__c = :oppFirstId];
        //number of related opportunity product corresponding to Muskan
        System.assertEquals(5, result.size());

        result = [SELECT Id 
                  FROM Opportunity_Product__c 
                  WHERE Name = 'Harshita'];
        //number of related opportunity product where name is Harshita
        System.assertEquals(0, result.size());

        result = [SELECT Id 
                  FROM Opportunity_Product__c 
                  WHERE Name = 'kartik'];
        //number of related opportunity product where name is Muskan
        System.assertEquals(1, result.size());
    }
}

