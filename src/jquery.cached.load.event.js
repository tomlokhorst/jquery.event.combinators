/*!
 * jQuery special load event.
 * 
 * Triggers load event event on images loaded from cache.
 * Only for browsers that don't trigger a native event.
 */

(function ($)
{
  $.event.special.load =
  {
    setup: function ()
    {
      // Use native DOM methods.
      return false;
    },

    add: function (handleObj)
    {
      // Only for images with .complete property that is true and have a trueish .width property
      if (this.complete && this.width)
      {
        var self = this;
        var triggeredNative = false;
        var handler = handleObj.handler;

        handleObj.handler = function ()
        {
          // Handler called for first time (possibly by browser).
          triggeredNative = true;
          handler.apply(this, arguments);
        };

        // Give the browser 1 millisecond to call load handler.
        setTimeout(function ()
        {
          if (triggeredNative) return;

          // Construct load event object.
          var e = $.Event("load");
          e.target = self;
          e.currentTarget = self;
          e.data = handleObj.data;

          $(self).trigger(e);
        }, 1);
      }
    }
  };
} (jQuery));

