const { query } = require("express");
const database = require("../firebase/firebaseConnection");

//Ex: if you want to find many students with major = KHMT or class = MT22KH05
// => findUnion("students", ["major", "class"], ["KHMT", "MT22KH05"])
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
          snapshot.forEach(doc => {
            const data = doc.data();
    
            queryResults.push({ id: doc.id, ...data });
          });
        }
    
        // Return the first result found, if any
        return ((queryResults.length > 0) ? queryResults[0] : null);
      } catch (error) {
        console.error('Error fetching document:', error);
        return {
          success: false,
          error: error.message
        };
      }
}

//Ex: if you want to find only one student with major = KHMT 
// => findIntersect("students", ["major"], ["KHMT"])
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
          // Return the first matching document with the password field removed
          const doc = snapshot.docs[0];
          const data = doc.data();
          
          return { id: doc.id, ...data };
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        return {
          success: false,
          error: error.message
        };
      }
}

//Ex: if you want to find all student in collection students
// => findAll("students")
const findAll = async (dbCollection) => {
    try {
      // Reference to the collection
      const collectionRef = database.collection(dbCollection);
        
      // Array to hold the results of individual queries
      let queryResults = [];
      const snapshot = await collectionRef.get();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        queryResults.push(data); // Push the modified data into queryResults
      });

      return queryResults;
    } catch(error) {
      console.error(error.message);
      return {
          success: false,
          error: error.message
      };
    }
}

//Ex: if you want to update student with id = 999 
// => updateOne("students", ["student_id"], [999], { contact_email: "123@gmail.com "})
const updateOne = async (collectionName, conditionFields, conditionValues, updatingInfo) => {
  try {
      const collectionRef = database.collection(collectionName);

      // Construct the query
      let query = collectionRef;
      conditionFields.forEach((field, index) => {
        query = query.where(field, '==', conditionValues[index]);
      });
      const snapshot = await query.limit(1).get();

      const batch = database.batch();
      snapshot.forEach((doc) => {
          const docRef = collectionRef.doc(doc.id);
          batch.update(docRef, updatingInfo);
      });

      await batch.commit();
      console.log(`${snapshot.size} documents updated successfully.`);
      return {
        success: true,
      }
  } catch (error) {
      console.error('Error updating documents:', error);
      return {
        success: false,
        error: error.message
      }
  }
};

//Ex: if you want to delete one student with id = 999 
// => deleteOne("students", ["student_id"], [999])
const deleteOne = async (collectionName, conditionFields, conditionValues) => {
  try {
    const collectionRef = database.collection(collectionName);

    // Construct the query
    let query = collectionRef;
    conditionFields.forEach((field, index) => {
      query = query.where(field, '==', conditionValues[index]);
    });
    const snapshot = await query.limit(1).get();

    const batch = database.batch();
    snapshot.forEach((doc) => {
      const docRef = collectionRef.doc(doc.id);
      batch.delete(docRef); // Use delete() instead of update()
    });

    await batch.commit();
    console.log(`${snapshot.size} documents deleted successfully.`);
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting documents:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

//Ex: if you want to check exist student with id = 999 
// => checkExist("students", ["student_id"], [999])
const checkExist = async (collectionName, conditionFields, conditionValues) => {
  try {
      const collectionRef = database.collection(collectionName);
      let query = collectionRef;
      conditionFields.forEach((field, index) => {
        query = query.where(field, '==', conditionValues[index]);
      });
  
      const querySnapshot = await query.get();
      
      if (querySnapshot.empty) {
          return {
              success: true,
              existed: false
          };
      } else {
          return {
              success: true,
              existed: true
          };
      }
  } catch (error) {
      console.error(error.message);
      return {
          success: false,
          error: error.message
      };
  }
};

module.exports = {
    findUnion,
    findIntersect,
    findAll,
    updateOne,
    deleteOne,
    checkExist
}