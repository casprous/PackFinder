# NCSU PackFinder

## Problem Statement

NCSU’s campus is large and full of nooks and crannies to lose objects like wallets, keys, or phones, and students are constantly moving between distant buildings, catching the WolfLine busses, or studying in the libraries. When a student loses one of these valuable items, the search process can be highly fragmented and frustrating. Currently, students rely on posting to various platforms, such as the r/NCSU subreddit or physically visiting the lost-and-found desks across campus.

### Target Users

We aim for our primary user base to be NCSU students, faculty and staff, who will want to utilize the platform because it centralizes all lost and found efforts into a single location. This eliminates the guesswork of figuring out where to look or post by providing immediate visual context on a campus map and clearly tracking if an item has been handed over to an official campus desk.

## Feature Description

* <ins>_Interactive Campus Map:_</ins> Users can view a map of the NCSU campus populated with color-coded pins (for example Red (Lost), Green (Found), Blue (Turned In)).
* <ins>_Forum-Style Feed:_</ins> Users can scroll through a chronologically ordered feed of lost and found posts, filterable by category (electronics/clothes/id) or location.
* <ins>_Location-Based Posting:_</ins> Users can create a post by dropping a precise pin on the map where an item was lost or discovered, and attach photos or descriptions of the item.
* <ins>_Status Tracking:_</ins> Found items can be updated by the finder, updating the status to reflect changes in its location(like dropped off at lost-and-found).



### PWA Capabilities

This application will be best suited for a PWA because of the following:

* <ins>_Real-time updates of lost items (status)_</ins>
* <ins>_Mobile accessibility:_</ins> People on campus typically do not carry their laptops around in hand, so mobile accessibility is a must. Having this application as a PWA would allow students to quickly open the app and post details on lost/found items.
* <ins>_Push notifications:_</ins> Notifications can alert users when someone replies to their lost/found item post. It can also send alerts when someone pins a found item near a location they marked.
* <ins>_Geolocation:_</ins> Map feature would benefit from geolocation APIs as students will use this feature while physically navigating campus.
* <ins>_Camera Integration:_</ins> Users will be able to take and upload pictures of lost and found items, locations of where it was lost/found, etc. when creating and replying to posts, which would be implemented using a Media Capture API. Having visual identification would increase the chance of correctly recognizing and returning items.
* <ins>_Offline Support:_</ins> Can show a styled page/ message that the user is currently offline so data cannot be loaded, so that there is graceful offline functionality.

## Wireframes

### Mobile Views
<img width="300" alt="image" src="https://github.com/user-attachments/assets/102891e5-a334-4793-994f-a687d5a4ced6" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/5421e4b5-4277-4d48-8574-3621f237cab9" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/2e6ebe0e-02c2-4073-b9a3-d302084a4edc" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/f6d406f7-fac9-4d55-bebd-8e0b7849c849" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/d5f737d3-9d23-4227-be4b-1e3bc8e117f0" />

### Desktop Views
<img width="1000" alt="image" src="https://github.com/user-attachments/assets/1718d5fe-7738-41f7-8c58-f43322fe66a6" />


## Sources of Data Needed

* <ins>_Geospatial Data:_</ins> We will need map tiles and geolocation functionality, which could be sourced through a third-party mapping API like Mapbox or Leaflet, which would be integrated with the browser’s Geolocation API.
* <ins>_User-Generated Content:_</ins> Text descriptions, user IDs (maybe unityid?), timestamps, and image files. This data will be collected via frontend forms, processed through the backend using express middleware to handle image uploads and route requests, and stored in the database.
* <ins>_Campus Locations:_</ins> A static list/database table of official NCSU lost-and-found desk coordinates to allow for quick “Turned In” status updates.

## Team Member Contributions

#### Cole Sprouse

* Came up with the initial "PackFinder" idea.
* Wrote the "Problem" "Target Users" "Proposed Solution" "Data Requirements/Acquisition" sections of the proposal
* Created the Desktop wireframes

#### Mallory Varinoski

* Assisted with write up.
* Added and formatted content in readme.
* Created Mobile View wireframes.

#### Ramisa Tafannum

* Wrote the "PWA Capabilities" section of the proposal
* Added and formatted readme with proposal content

#### Milestone Effort Contribution

Cole Sprouse | Mallory Varinoski | Ramisa Tafannum
------------- | ------------- | --------------
34%            | 33%            | 33%
