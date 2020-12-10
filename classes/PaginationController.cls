public with sharing class PaginationController {

    /*
        Method to fetch Account records
    */
    @AuraEnabled( cacheable = true ) 
    public static List< Account > fetchAccounts() { 
        
        return [ SELECT Id, Name, Industry,  
                        ( SELECT Id, FirstName, LastName 
                            FROM Contacts )
                   FROM Account 
               ORDER BY Name
                  LIMIT 100]; 
         
    }

}