# infoTrees
![Cover Image](READMEpics/Pasted%20image.png)

This is a simple chat app.  The primary difference between this and similar apps is the ability to create sub-groups of chat topics.  This enables more fine-grained messaging and control with different groups and subjects. 


__Note__ - To play around with the app you'll need to create at least two accounts to send exchange messages between each other.  If you'd like to skip this step you can log in to these sample accounts below.  Please remember that I am not responsible for any content posted under these accounts.  

|Username|Password|
|-|-|
|cat|mousefinder1|
|dog|catfinder2|
|bob|animalparent3|



# Features

### Messaging Groups
Conversations are organized into groups.  Groups may have multiple members.  These are displayed on the left hand pane of the app. 

The left pane has the following fields:
*   A text input to create a conversation group, or select an existing one.  
*   The list of existing conversation groups. 
*   A text input for adding group members. 
*   A text input for creating and naming sub-groups.  
*   A button to leave a selected group.  

![Message View](READMEpics/Pasted%20image%201.png)

### Chat view
Messages are displayed on the main 

![Chat View](READMEpics/Pasted%20image%202.png)

### Sub-groups
Sub-groups may be created, each with different members.  The creation of a sub-group creates a clickable link in the chat view so that users can follow the conversation into the sub-groups.  

### Messages
Messages are exchanged like most chat apps, with each message showing the sender, recievers, time and date, and the message content itself.  

### Unread counts
Each conversation group shows the count of unread messages.  

### Message state colors
Messages are visually distinguished by color and margins between sent messages, recieved messages, unread messages, and sub-groups created.  

### AJAX Communications
Interaction with the server on the main page is done through AJAX messaging to improve the user experience.  

### Realtime updates
There is continuous polling of the server to check for new messages.  The server caches replies to avoid database calls when it gets polled for updates without changes.

### Mobile View
On smaller screens the panes expand to occupy the full width of smaller screens.  Users can swipe sideways to move between viewing message groups and the chat view.  

![Chat View](READMEpics/Pasted%20image%203.png)
![Chat View](READMEpics/Pasted%20image%204.png)



## Minor Features
*   Error messaging - Users are alerted to input errors
    *   Adding non-existent group members
    *   Sending messages without recipients
*   Server unreachable notification - a banner is displayed to the user when AJAX messages are not responded to.  

<br><br>

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

<br><br>

# Database Implementation
The data is organized by two primary tables.  all message data itself is organized as a tree with branching nodes.  Messages are all children of a conversation or folder node.  Messages within a chat are siblings of each other.  Sub-groups are simply nodes that have further branches.  There is a flag set to distinguish between message nodes and group nodes, but this is only for the sake of the interface.  

At the moment the interface does not allow the generation of message nodes with children, but the back-end does not prohibit this.  This can be implemented to allow comments on individual messages.  

### Messages and groups are stored as a tree of nodes

```mermaid
graph LR

a(group A)
subgraph A
    b1([message 1])
    b2(sub-group B)
    b3([message 2])
    b4([message 3])
end 

subgraph B
    c1([message 4])
    c2([message 5])
    c3([message 6])
end

a --- b1 & b2 & b3 & b4
b2 --- c1 & c2 & c3

```

### To enable one-to-many messaging a second table records the targets of each node. 

```mermaid 
graph LR

subgraph Node
    a(Previous Node)
    b(id \n Node base_id \n timestamp created_on \n User author \n text content \n Bool folder )
end

subgraph Target
    c( id \n Node node \n User user \n Bool read)
    d( id \n Node node \n User user \n Bool read)
end
a---b
b --- c & d

```


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

<br><br>

# General AJAX Information Flow

There are essentially only two classes of information handled by the page.  Conversation groups are referred to as folders, and messages are nodes.  

1)  __get_folders__ - the server returns a list of node_id's for each folder.  
2) __get_folder__ - the server returns a single node with all folder data. 
3) __folder_selected__ - the client then calls __get_nodes__. 
4) __get_nodes__ - the server returns a list of node_id's for the current folder. 
5) __get_node__ - the server returns a single node with all message data.  
6) __mark_read__ - the client tells the server to mark nodes as read.  

___Note___ - The __get_nodes__ call returns a fixed number of replies, and this is incremented when the user scrolls to the top of the message list.  This is to prevent fully loading a conversation every time the user views it.  



## Todo - features

### Separate Content Database
At this point of development message content is stored as plain text in the node database table.  


That would leave the node table solely responsible for organization, but not the content itself.  Each node in the table would only store a reference to the full content.  

### Rich Text message editing
The next step is to enable rich-text formatting and attachments.  

### Attachments
This would ideally be implemented with a separate content database or server.  On the client side this should include a content preview. 


### View by User page
I am currently developing a page where users can view messages from specific users across all conversations.  


# Deployment

The site is hosted on Heroku for both web hosting and Postgres database hosting.  Originally I tried using the free tier of ElephantSQL but it seemed that the latency between the two hurt the user experience.  This was greatly improved by using Heroku for the database as well as the web hosting.  

Heroku is linked to the github repository, and deployments are triggered manually from the main branch.  

# Todo List

*   Refresh folder list on deletions
*   View by User page
*   Heroku Deployment
*   Separate content database
*   Attachments
*   Rich text input
*   Message comments
*   Search for group selection
*   Search for messages

### Maybe todo list
*   Message read status display


