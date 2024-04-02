const database = require("../firebase/firebaseConnection");

const findUnion = async (dbCollection, conditionFields, conditionValues) => {
    try {
        // Reference to the collection
        const collectionRef = database.collection(dbCollection);
    
        // Array to hold the results of individual queries
        const queryResults = [];
    
        // Execute a separate query for each field-value pair
        for (let i = 0; i < conditionFields.length; i++) {
          const field = conditionFields[i];
          const value = conditionValues[i];
    
          // Construct and execute the query
          const query = collectionRef.where(field, '==', value).limit(1);
          const snapshot = await query.get();
    
          // Add the result to the array
          snapshot.forEach(doc => queryResults.push({ id: doc.id, ...doc.data() }));
        }
    
        // Return the first result found, if any
        return ((queryResults.length > 0) ? queryResults[0] : null);
      } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
      }
}

const findIntersect = async (dbCollection, conditionFields, conditionValues) => {
    try {
        // Reference to the collection
        const collectionRef = database.collection(dbCollection);
    
        // Construct the query
        let query = collectionRef;
        conditionFields.forEach((field, index) => {
          query = query.where(field, '==', conditionValues[index]);
        });
    
        // Execute the query
        const snapshot = await query.limit(1).get();
    
        // Extract data from the snapshot
        if (snapshot.empty) {
          // No matching documents found
          return null;
        } else {
          // Return the first matching document
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
      }
}

module.exports = {
    findUnion,
    findIntersect
}