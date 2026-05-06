-- --------------------------------------------------------
-- Dumping data for table packfinder.Location
-- (Iconic NC State University Campus Locations)
-- --------------------------------------------------------
INSERT INTO `Location` (`loc_id`, `loc_name`, `loc_lat`, `loc_lon`) VALUES
    (1, 'D.H. Hill Jr. Library', 35.78772000, -78.66971000),
    (2, 'James B. Hunt Jr. Library', 35.76991000, -78.67754000),
    (3, 'Talley Student Union', 35.78425000, -78.67021000),
    (4, 'Carmichael Gymnasium', 35.78361000, -78.67344000),
    (5, 'The Brickyard', 35.78742000, -78.67055000),
    (6, 'Reynolds Coliseum', 35.78385000, -78.66782000),
    (7, 'Carter-Finley Stadium', 35.80080000, -78.71960000),
    (8, 'Court of North Carolina', 35.78622000, -78.66751000),
    (9, 'Wolf Plaza', 35.78501000, -78.66952000),
    (10, 'EB2 (Engineering Building II)', 35.77221000, -78.67414000);

-- --------------------------------------------------------
-- Dumping data for table packfinder.User
-- (Usernames adjusted to look like NC State Unity IDs)
-- --------------------------------------------------------
INSERT INTO `User` (`user_id`, `usr_first_name`, `usr_last_name`, `usr_username`, `usr_password`, `usr_salt`) VALUES
    (1, 'Stu', 'Dent', 'sdent', '83d9bdb5e20f3571b087db9aabf190a296741c3e864d7742f35658cfccc1b79c4599aad25084aa9a28c649a50c92244227b3e53e197621301d619d1ea01873c4', '48c8947f69c054a5caa934674ce8881d02bb18fb59d5a63eeaddff735b0e9'),
    (2, 'Gra', 'Duate', 'gduate', 'e289219c34f9a32ebc82393f09719b7f34872de95463242b5ffe8bb4b11a5fe7d454f9f5d082c8207c5d69b220ba06624b4bb15ffa05cc7d7d53c43f9e96da6a', '801e87294783281ae49fc8287a0fd86779b27d7972d3e84f0fa0d826d7cb67dfefc');

-- --------------------------------------------------------
-- Dumping data for table packfinder.item
-- (Typical items lost or found by college students)
-- --------------------------------------------------------
INSERT INTO `item` (`item_id`, `item_name`, `item_desc`, `item_status`, `item_reply`) VALUES
    (1, 'Red Wolfpack Hoodie', 'Size Large, left on a chair on the 2nd floor in the quiet study area.', 'Lost', NULL),
    (2, 'NC State Student ID', 'Found on the ground near the main entrance.', 'Found', 'I turned it in to the main information desk!'),
    (3, 'TI-84 Plus Calculator', 'Black calculator with a "Go Pack" sticker on the back.', 'Lost', 'I checked the front desk, no luck yet.'),
    (4, 'AirPods Pro Case', 'Just the case, no headphones. Left on a table near the coffee shop.', 'Found', 'Meet me at the Starbucks inside Talley to claim it.'),
    (5, 'Keys on a red lanyard', '3 keys and a gym fob on a red NC State lanyard.', 'Lost', NULL);

-- --------------------------------------------------------
-- Dumping data for table packfinder.Item_Location
-- (Mappings tying the items to the campus buildings)
-- --------------------------------------------------------
INSERT INTO `Item_Location` (`IL_item_id`, `IL_loc_id`) VALUES
    (1, 2), -- Hunt Library
    (2, 3), -- Talley Student Union
    (3, 10), -- EB2
    (4, 1), -- D.H. Hill Jr. Library
    (5, 4); -- Carmichael Gymnasium

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