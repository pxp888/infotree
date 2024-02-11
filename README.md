# infoTrees
This is a simple chat app.  The primary difference between this and similar apps is the ability to create sub-groups of chat topics.  This enables more fine-grained messaging and control with different groups and subjects. 


# Features

### Messaging Groups
Conversations are organized into groups.  Groups may have multiple members.  These are displayed on the left hand pane of the app. 

The left pane has the following fields:
*   A text input to create a conversation group, or select an existing one.  
*   The list of existing conversation groups. 
*   A text input for adding group members. 
*   A text input for creating and naming sub-groups.  
*   A button to leave a selected group.  


### Chat view
Messages are displayed on the main 

### Sub-groups
Sub-groups may be created, each with different members.  The creation of a sub-group creates a clickable link in the chat view so that users can follow the conversation into the sub-groups.  

### Messages
Messages are exchanged like most chat apps, with each message showing the sender, recievers, time and date, and the message content itself.  

### Unread counts
Each conversation group shows the count of unread messages.  

### Message state colors
Messages are visually distinguished by color and margins between sent messages, recieved messages, unread messages, and sub-groups created.  

### AJAX Communications
Interaction with the server on the main page is done through AJAX messaging to improve the user experience.  This avoids having to reload the page when changes are reflected.  

### Realtime updates
There is continuous polling of the server to check for new messages.  The server caches replies to avoid database calls when it gets polled for updates without changes.

### Mobile View
On smaller screens the panes expand to occupy the full width of smaller screens.  Users can swipe sideways to move between viewing message groups and the chat view.  

## Minor Features
*   Error messaging - Users are alerted to input errors
    *   Adding non-existent group members
    *   Sending messages without recipients
*   Server unreachable notification

# Primary Interaction

## Group Creation
Groups are created by entering a group name and pressing return.  This creatse a new conversation group, and moves the focus to the 'Add Group Member'  field.  

If a group with the same name exists in the users group list it will be selected instead of creating a new group.  

## Group selection
Groups and sub-groups are listed on the left-hand side of the app.  Users can select which group they wish to interact with by clicking the group name.  

## Add Members to a group
Group members are added to each group by typing their username in the 'Add Group Member' field and pressing return.  

Users are alerted if the username is not valid.  

## Create Sub-Group
Sub-groups can be created as children of the selected group.  Each sub-group has it's own name or subject, and its own set of members. 

## Leave Group
The leave group button allows users to leave conversation groups.  They will be asked to confirm if this is what they intend.  

Groups are automatically deleted when no group members remain in each group.  

## Chat View
The right hand side show the primary display for messages.  This is a scrollable history of messages for each group.  

WHen sub-groups are created they also show up in the message history, and can be clicked to select them to follow the conversation if desired.  

## Message Composition and Sending
Messages are written in a textarea at the lower right side of the app. To send a message there is a button immediately below.  This enables messages to have line returns for more natural formatting.  


# Database Implementation
The data is organized by two primary tables.  all message data itself is organized as a tree with branching nodes.  Messages are all children of a conversation or folder node.  Messages within a chat are siblings of each other.  Sub-groups are simply nodes that have further branches.  There is a flag set to distinguish between message nodes and group nodes, but this is only for the sake of the interface.  

At the moment the interface does not allow the generation of message nodes with children, but the back-end does not prohibit this.  This can be implemented to allow comments on individual messages.  

To enable one-to-many messaging a second table records the targets of each node. 

The database tables are built as follows:

### Node Table

|Field|Description|
|-|-|
|id|Primary Key and Node ID|
|path|Group Name|
|base|Primary key or ID of the parent node, blank for root nodes|
|created_on|time stamp of creation time
|author|User who created the node
|content|Message content
|folder|Boolean flag to indicate if the node represents a conversation group or folder

### Target Table

|Field|Description|
|-|-|
|id|Primary Key|
|node|ID of node|
|user|Target of node, (may be multiple targets per node)|
|read|Boolean flag to indicate of the user has recieved the node


## Todo - features
At this point of development message content is stored as plain text in the node database table.  

The next step is to enable rich-text formatting and attachments.  This would ideally be implemented with another database or table that only stores the full content of each message.  

That would leave the node table solely responsible for organization, but not the content itself.  Each node in the table would only store a reference to the full content.  






# Todo List

*   THIS README. 
*   Refresh folder list on deletions
*   View by User page
*   Heroku Deployment
*   Separate content database
*   Attachments
*   Message comments
*   Search for group selection
*   Search for messages

### Maybe todo list
*   Message read status display