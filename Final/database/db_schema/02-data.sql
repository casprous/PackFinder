-- --------------------------------------------------------
-- Dumping data for table packfinder.Location
-- (Iconic NC State University Campus Locations)
-- --------------------------------------------------------
INSERT INTO `Location` (`loc_id`, `loc_name`, `loc_lat`, `loc_lon`, `is_desk`) VALUES
    (1, 'D.H. Hill Jr. Library - Ask Us Desk', 35.78772000, -78.66971000, 1),
    (2, 'James B. Hunt Jr. Library - Ask Us Desk', 35.76928000, -78.67643000, 1),
    (3, 'Talley Student Union - Information Desk', 35.78425000, -78.67021000, 1),
    (4, 'NCSU Police Facility Public Safety Center', 35.7857266158586, -78.68210920285291, 1),
    (5, 'Carmichael Gymnasium - Front Desk', 35.78361000, -78.67344000, 1);

-- --------------------------------------------------------
-- Dumping data for table packfinder.User
-- (Usernames adjusted to look like NC State Unity IDs)
-- --------------------------------------------------------
INSERT INTO `User` (`user_id`, `usr_first_name`, `usr_last_name`, `usr_username`, `usr_email`, `usr_password`, `usr_salt`) VALUES
(1, 'Stu', 'Dent', 'sdent', 'sdent@ncsu.edu', '$2b$10$xqRM3LeROH4R1eX8sPbUZeGGLeXEc4JzWbf39YLl83kYzd3v0YRdW', 'bcrypt'),
(2, 'Gra', 'Duate', 'gduate', 'gduate@ncsu.edu', '$2b$10$9sQP9rqaKhvwc2Lkn2yRn.rcj36jy73F.TL79Kvku0B5762mX2jf6', 'bcrypt');
-- --------------------------------------------------------
-- Dumping data for table packfinder.item
-- (Typical items lost or found by college students)
-- --------------------------------------------------------
INSERT INTO `item` (`item_id`, `item_name`, `item_desc`, `item_status`, `item_reply`) VALUES
    (1, 'Red Wolfpack Hoodie', 'Size Large, left on a chair on the 2nd floor in the quiet study area.', 'Lost', NULL),
    (2, 'NC State Student ID', 'Found on the ground near the main entrance.', 'Found', 'I turned it in to the main information desk!'),
    (3, 'TI-84 Plus Calculator', 'Black calculator with a "Go Pack" sticker on the back.', 'Lost', 'I checked the information desk, no luck yet.'),
    (4, 'AirPods Pro Case', 'Just the case, no headphones. Left on a table near the coffee shop.', 'Found', 'Meet me at the Starbucks inside Talley to claim it.'),
    (5, 'Keys on a red lanyard', '3 keys and a gym fob on a red NC State lanyard.', 'Lost', NULL);

-- --------------------------------------------------------
-- Dumping data for table packfinder.Item_Location
-- (Mappings tying the items to the campus buildings)
-- --------------------------------------------------------
INSERT INTO `Item_Location` (`IL_item_id`, `IL_loc_id`) VALUES
    (1, 2), -- Hunt Library
    (2, 3), -- Talley Student Union
    (3, 3), -- Talley Student Union
    (4, 1), -- D.H. Hill Jr. Library
    (5, 5); -- Carmichael Gymnasium

-- --------------------------------------------------------
-- Dumping data for table packfinder.User_Items
-- (Mappings tying users to the items they reported)
-- --------------------------------------------------------
INSERT INTO `User_Items` (`USI_usr_id`, `USI_item_id`) VALUES
    (1, 1),
    (2, 2),
    (1, 3),
    (2, 4),
    (1, 5);