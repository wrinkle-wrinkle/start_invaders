# Start Invaders

Chrome extension that replaces the startpage.  Provides weather, three subreddit feeds, and 14 links.  Everything is customizeable.  As well, clicking the **New Game** button at the bottom converts the page into a Space Invaders inspired game.

## Installing

1. Go to chrome://extensions/
2. Enable Developer mode
3. Load unpacked extension
4. Navigate to the start_invaders folder

## Customizing the Start Page

The extensions comes with a default template including some links and the most popular subreddits.  To customize the page, just click on the **Customize** button in the top right corner.  Once you click that all of the elements on the page are available for editing.  Just click on any element and an overlay will slide in and you can update the details.  When you first load the extension, the weather won't display anything, because you first need to get a free API key from [Dark Sky](https://darksky.net/dev).  Once you do that, in Edit Mode, click on the weather, and enter your API key and you Lat/Lon, as well as a location name.

## Playing the Game

When you click the **New Game** button on the bottom right, the page will transform into a Space Invaders style game.

  * Enter: Start/Restart Game
  * Left/Right Arrows: Move
  * Space Bar: Shoot lasers
  * Escape: Pause game
  * Delete: Stop game and return to start page

## Built With

* [Bootstrap](https://getbootstrap.com/docs/3.3/) - Web framework
* [jQuery](https://jquery.com/) - Javascript
* [p5.js](https://p5js.org/) - Game mechanics
* [Dark Sky API](https://darksky.net/dev) - Weather API

## Acknowledgments

* [The Coding Train](http://thecodingtrain.com/) - Great resource for p5.js tutorials as well as just general coding tutorials.  I got a lot of the code from one of his coding challenges.
