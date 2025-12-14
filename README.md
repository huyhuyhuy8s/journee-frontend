# Journee - A journaling app with photo and geolocation

Journee is a mobile-first social journaling and location app that turns real‑time location trails into a personal, shareable timeline of places, photos, and thoughts. Users can privately record daily routes and moments, then choose what to share with friends through a lightweight social feed. Core capabilities include live location sharing, automatic journey logging, rich journal posts with images and notes, privacy controls, and offline capture with seamless sync once online.

## Who are we?

We are a group of two final year students of HCMC University of Technology and Education

| Member | Expertise |
| --- | --- |
| Lê Minh Huy | Full-stack Developer in Web Development with Node.js, React |
| Nguyễn Lê Tùng Chi | UI/UX Designer in Mobile Development |

## Why this matters, and how we’re different

- Social maps without the creep factor: Unlike Life360’s safety-first positioning, Journee emphasizes spontaneous, fun meetups and memory keeping while normalizing granular privacy controls such as freeze and selective sharing, inspired by Zenly’s “social-first” approach.
- More than a passive timeline: Google Maps Timeline is powerful for personal history but lacks social creation and interaction. Journee blends automatic location history with journals, reactions, and comments to make location a medium for connection, not just a log.
- Built for the audience’s expectations: For 16–24-year-olds who use social apps daily, Journee focuses on fast, visually engaging UI, privacy, and battery/data efficiency, with “rewind,” heat maps, and feeds that feel familiar yet contextual to place and time.

## Key features at a glance

- Live location sharing with friends and family, with temporary pause/freeze and audience controls.
- Auto journal: timeline of visits and routes; add photos and reflections; browse by day, week, month, year; view heat maps; “On this day” reminders.
- Social feed: post journals or single-location moments; like, comment, share, and archive; lightweight messaging to coordinate plans.
- Offline-first capture with conflict‑safe sync, minimizing data loss when connectivity is poor.

## Technical choices and rationale

- React Native front end for cross‑platform delivery and fast iteration compared to platform‑specific stacks.
- Node.js + Express for a unified JavaScript backend and mature middleware ecosystem; pairs naturally with [Socket.IO](http://Socket.IO) for real‑time events.
- Firebase Firestore for near real‑time sync, offline caching, and scalable queries, reducing backend ops versus rolling a custom stack. Compared to Firebase Realtime Database, Firestore offers richer querying and better scalability for evolving data models.
- [Socket.IO](http://Socket.IO) for low‑latency updates and resilient fallbacks over raw WebSockets, supporting auto‑reconnect, rooms, and event acks; this simplifies presence, live location, and feed updates versus managing pure WebSocket plumbing.

## Scope decisions for a focused MVP

- Excluding voice/video calls and community groups to concentrate on the core loop of location, journaling, and lightweight social interactions. This mirrors how successful products refined messaging before expanding into calls.

## Who it’s for

- Students and young adults in Vietnam who want to capture and share everyday journeys with strong privacy, a delightful UI, and battery/data‑aware tracking.

## Contact Information

Mail: [leminhhuy0404.work@gmail.com](mailto:leminhhuy0404.work@gmail.com)

## Special Thanks

- Used images for demonstration by [@astro_lover04](https://www.instagram.com/astro_lover04/)
