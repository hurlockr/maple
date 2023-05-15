import { Script } from "./types";
import * as admin from 'firebase-admin';

/** Seed Firestore with topic events */
export const script: Script = async ({ db }) => {
  // Define your test data
  const topicEvents = [
    {
      topicName: 'bill-example-1',
      index: 1,
      type: "hearing",
      name: "Example Hearing",
      id: 1,
      location: "Location 1",
      fullDate: new Date(),
      year: "2023",
      month: "05",
      date: "13",
      day: "Friday",
      time: "10:00AM",
      relatedBills: [
        {
          court: "exampleCourt",
          id: "example-1",
          name: "Example Bill 1",
        },
      ],
    },
    {
      topicName: 'org-example-1',
      index: 2,
      type: "session",
      name: "Example Session",
      id: 2,
      location: "Location 2",
      fullDate: new Date(),
      year: "2023",
      month: "06",
      date: "14",
      day: "Saturday",
      time: "15:00PM",
      relatedOrgs: [
        {
          id: "example-1",
          name: "Example Org 1",
        },
      ],
    },
  ];

  // Trigger the deliverNotifications function by creating a topic event
  async function createTopicEvent(topicEvent: any) {
    await db.collection('/topicEvents').add(topicEvent);
  }

  // Run the script
  console.log(`Adding ${topicEvents.length} topic events to Firestore...`);
  for (const topicEvent of topicEvents) {
    await createTopicEvent(topicEvent);
  }
  console.log(`Added ${topicEvents.length} topic events to Firestore.`);
};
