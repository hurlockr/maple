// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore for all subscriptions for the given topic event, then creates a notification document in the user's notification feed. 
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {Timestamp} from '../firebase'

// Get a reference to the Firestore database
const db = admin.firestore();

console.log('DEBUG: publishNotifications.ts loaded');
const createNotificationFields = (topicEvent: { [x: string]: any; name?: any; id?: any; time?: any; }, entity: { court: any; id: string; name: string; }, type: string) => {
  let topicName = '';
  let header = '';
  let court = null;

  console.log('DEBUG: topicEvent:', topicEvent);
  switch (type) {
    case 'bill':
      topicName = `bill-${entity.court}-${entity.id}`;
      header = entity.id;
      court = entity.court;
      break;
    case 'org':
      topicName = `org-${entity.id}`;
      header = entity.name;
      break;
    default:
      // handle exception for entities that don't fit schema
      console.log(`Invalid entity type: ${type}`)
      throw new Error(`Invalid entity type: ${type}`);
  }

  return {
    topicName,
    uid: "",  // user id will be populated in the publishNotifications function
    notification: {
      bodyText: topicEvent.name, // may change depending on event type
      header,
      id: topicEvent.id,
      subheader: topicEvent.name, // may change depending on event type
      timestamp: topicEvent.time, 
      type,
      court,
    },
    createdAt: Timestamp.now(),
  };
};

// Define the publishNotifications function
export const httpsPublishNotifications = functions.https.onRequest(async (request, response) => {
    try {
      console.log('httpPublishNotifications triggered');

      const topicEventId = request.body.topicEventId;

      if (!topicEventId) {
        response.status(400).send('Missing topicEventId');
        return;
      }

      const snapshot = await db.collection('events').doc(topicEventId).get();

      if (!snapshot.exists) {
        response.status(400).send('No document to process');
        return;
      }

      // Get the newly created topic event data
      const topicEvent = snapshot.data();

      if (!topicEvent) {
        console.error('Invalid topic event data:', topicEvent);
        return;
      }

      console.log('DEBUG: topicEvent:', topicEvent);

      // Extract related Bill or Org data from the topic event
      const { relatedBills, relatedOrgs } = topicEvent;

      console.log('DEBUG: relatedBills:', relatedBills);
      console.log('DEBUG: relatedOrgs:', relatedOrgs);

      const notificationPromises: any[] = [];

      if (relatedBills) {
        await Promise.all(relatedBills.map(async (bill: { court: any; id: string; name: string; }) => {
          // console.log('DEBUG: Processing bill:', bill);
      
          const notificationFields = createNotificationFields(topicEvent, bill, 'bill');
      
          // console.log('DEBUG: notificationFields:', notificationFields);
      
          const subscriptionsSnapshot = await db
            .collectionGroup('activeTopicSubscriptions')
            .where('topicName', '==', notificationFields.topicName)
            .get();
      
          // console.log('DEBUG: subscriptionsSnapshot:', subscriptionsSnapshot);
      
          subscriptionsSnapshot.docs.forEach((doc) => {
            const subscription = doc.data();
            const { uid } = subscription;
      
            // console.log('DEBUG: Processing subscription:', subscription);
      
            // Add the uid to the notification document
            console.log('DEBUG: uid:', uid)
            notificationFields.uid = uid;
      
            // Create a notification document in the user's notification feed
            console.log ("populating notification document")
            notificationPromises.push(
              db.collection(`users/${uid}/userNotificationFeed`).add(notificationFields)
            );
          });
        }));
      }
      
      // If there are related orgs, create a notification document for each org subscription
      if (relatedOrgs) {
        await Promise.all(relatedOrgs.map(async (org: { court: any; id: string; name: string; }) => {
          console.log('DEBUG: Processing org:', org);
      
          const notificationFields = createNotificationFields(topicEvent, org, 'org');
      
          console.log('notificationFields:', notificationFields);
      
          const subscriptionsSnapshot = await db
            .collectionGroup('activeTopicSubscriptions')
            .where('topicName', '==', notificationFields.topicName)
            .get();
          
          // console.log('DEBUG: subscriptionsSnapshot:', subscriptionsSnapshot);
      
          subscriptionsSnapshot.docs.forEach((doc) => {
            const subscription = doc.data();
            const { uid } = subscription;
      
            // console.log('DEBUG: Processing subscription:', subscription);
      
            // Add the uid to the notification document
            notificationFields.uid = uid;
      
            // Create a notification document in the user's notification feed
            notificationPromises.push(
              db.collection(`users/${uid}/userNotificationFeed`).add(notificationFields)
            );
          });
        }));
      }
      

    console.log('DEBUG: Waiting for all notification documents to be created');

    // Wait for all notification documents to be created
    await Promise.all(notificationPromises);

    console.log('DEBUG: publishNotifications completed');

    response.status(200).send('Successfully published notifications');
  } catch (error) {
    console.error('Error in publishNotifications:', error);
    response.status(500).send('Internal server error');
  }
});
