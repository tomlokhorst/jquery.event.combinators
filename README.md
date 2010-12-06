jQuery Event Combinators
========================

Experimental combinators for jQuery events.

Examples
--------

    $('input[type=button]').whenAll().bind('click', function(e)
    {
      console.log('All buttons clicked!');
    });

`.whenAll()` triggers the event handler when all buttons have been clicked, instead of just one of them.

----


    $('input[type=button]').ignoreUntil('click').bind('mouseover', function(e)
    {
      console.log('mouseover!');
    });

`.ignoreUntil(type)` delays binding of event listener until the event `type` has occurred.

