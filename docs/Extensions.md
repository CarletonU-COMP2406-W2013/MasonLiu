Extensions
==========

We had planned to support commenting on pictures, with registered users being able to view comments for an individual picture and add
their own. This would be done by having a button attatched to each picture that would either open a dialog with the comment thread, or
link to a seperate page displaying the picture and comments. The comment would be submitted via an ajax request, and added to a Comment
(mongoose) document associated with the User that submitted it. However, there were difficulties implementing this feature, so all the
application logic for it has been removed. The comment buttons have been left on the cateogry viewer page to indicate how they would 
normally appear.

PictureHub was originally designed as a quick and easy image sharing application. However, it could be developed 
into more of a community, by implementing features such as messaging between users, user-defined categories (public or 
private, e.g. "invite-only" categories), and category-specific message boards, allowing users with similar interests 
more ways to interact with each other. This could be done by defining additional document schemas for messages between
users and message board posts, modifying the User schema to accomodate messages sent/received, adding the message boards
themselves (simply a comment thread index) to category pages, and adding a form for custom category creation (the implementation
of categories would have to be redesigned, as the routing for each category is hard-coded).

As it is now, the application allows any registered user to add pictures to any category. If a user decides to include in a category
content that is not relevant to the category (perhaps multiple times), this behaviour would compromise the intent of the application. One
way to resolve this is to allow users to nominate pictures for relocation or removal. When a picture receives enough of these nominations,
it could be automatically removed from the category, and added to a new one if it was nominated for relocation. This could be implemented
by modifying the picture schema to keep a count of nominations and suggested categories, and creating a small pop-up form that is linked 
to each image, allowing users to specify what to nominate it for. Upon submission of the nomination form, the server would check if the 
picture had reached its nomination threshold and react accordingly.

PictureHub could also be extended to support audio and video files (which would probably warrant renaming the application...MediaHub?).
Ideally, these could be all integrated into the same category, such that opening an image viewer on a video would simply display the video, 
and opening the viewer on an audio file would show a simple interface to play/pause/restart the audio clip. To implement these changes, the
gallery page, home page and image viewer would require modification, and new schemas for different media files should probably be defined.