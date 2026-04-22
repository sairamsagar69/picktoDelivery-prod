# Firestore Rules Change Log

This document tracks all changes made to the `firestore.rules` file to maintain a clear history of security rule modifications.

* Date : 22/04/2026       
* Collections Affected: `riders`
* Purpose: Secure Rider Onboarding and Data Access
* Explanation: 
    **Create:** Allows any authenticated user to create a new document in the `riders` collection (i.e., sign up).
    **Read:** Allows a user to read their own document if their `uid` matches the document ID. 
    **Update:** Prevents users from updating their own status. Only backend processes can change the `status` field. 
