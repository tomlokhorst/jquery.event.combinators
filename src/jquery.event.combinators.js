/*!
 * jQuery Event Combinators
 * 
 * Copyright (c) 2010, Tom Lokhorst
 * Released under BSD license, see LICENSE file.
 */

(function ($)
{
  $.fn.whenAll = function()
  {
    var self = $(this);

    $.each(["bind", "one"], function (_, nm)
    {
      var originalFn = self[nm];
      self[nm] = function(type, data, fn)
      {
        if (typeof type === "object")
        {
          for (var key in type)
            self[nm](key, data, type[key], fn);

          return self;
        }
        
        if ($.isFunction(data) || data === false)
        {
          fn = data;
          data = undefined;
        }

        var ln = self.length; // Calculate .length at time of .bind call
  
        var args = [];
        self.each(function (i, o)
        {
          var handler = function ()
          {
            args[i] = arguments;
            
            for (var j = 0; j < ln; j++)
              if (!args[j])
                return;
  
            fn.apply(self, transpose(args));
            args = [];
          };

          originalFn.call($(o), type, data, handler);
        });

        return self;
      };
    });

    return self;
  };


  $.fn.whenAny = function()
  {
    var self = $(this);

    var originalOne = self.one;
    self.one = function(type, data, fn)
    {
      if (typeof type === "object")
      {
        for (var key in type)
          self.one(key, data, type[key], fn);

        return self;
      }

      if ($.isFunction(data) || data === false)
      {
        fn = data;
        data = undefined;
      }

      var handler = function (e)
      {
        self.unbind(e, handler);
        return fn.apply(self, arguments);
      }

      originalOne.call(self, type, data, handler);

      return self;
    };

    return self;
  };


  $.fn.ignoreUntil = function(sel, outerType)
  {
    var self = $(this);

    if (typeof sel === "string")
    {
      outerType = sel;
      sel = self;
    }

    var originalOne = self.one;
    $.each(["bind", "one"], function (_, nm)
    {
      var originalFn = self[nm];
      self[nm] = function(type, data, fn)
      {
        if (typeof type === "object")
        {
          for (var key in type)
            self[nm](key, data, type[key], fn);

          return self;
        }

        if ($.isFunction(data) || data === false)
        {
          fn = data;
          data = undefined;
        }

        originalOne.call(sel, outerType, function ()
        {
          originalFn.call(self, type, data, fn);
        });

        return self;
      };
    });

    return self;
  };


  $.fn.ignoreAfter = function(sel, outerType)
  {
    var self = $(this);

    if (typeof sel === "string")
    {
      outerType = sel;
      sel = self;
    }

    var originalOne = self.one;
    $.each(["bind", "one"], function (_, nm)
    {
      var originalFn = self[nm];
      self[nm] = function(type, data, fn)
      {
        if (typeof type === "object")
        {
          for (var key in type)
            self[nm](key, data, type[key], fn);

          return self;
        }

        if ($.isFunction(data) || data === false)
        {
          fn = data;
          data = undefined;
        }

        originalOne.call(sel, outerType, function ()
        {
          self.unbind(type, fn);
        });

        originalFn.call(self, type, data, fn);

        return self;
      };
    });

    return self;
  };


  $.each(["bind", "one"], function (_, nm)
  {
    var originalFn = $.fn[nm];
    $.fn[nm + "All"] = function(types, data, fn)
    {
      var self = $(this);

      if ($.isFunction(data) || data === false)
      {
        fn = data;
        data = undefined;
      }

      var ln = types.length;
      var args = [];

      $(types).each(function (i, type)
      {
        originalFn.call(self, type, data, function()
        {
          args[i] = arguments;

          for (var j = 0; j < ln; j++)
            if (!args[j])
              return;

          fn.apply(self, transpose(args));
          args = [];
        });
      });

      return self;
    };
  });


  $.each(["bind", "one"], function (_, nm)
  {
    var originalFn = $.fn[nm];
    $.fn[nm + "Both"] = function(type1, type2, data, fn)
    {
      var self = $(this);

      if ($.isFunction(data) || data === false)
      {
        fn = data;
        data = undefined;
      }

      self[nm + "All"]([type1, type2], data, function()
      {
        var args = transpose(arguments);
        fn.apply(self, args[0].concat(args[1]));
      });

      return self;
    };
  });


  $.fn.replayAfter = function(sel, outerType, bufferSize)
  {
    var self = $(this);

    if (typeof sel === "string")
    {
      outerType = sel;
      bufferSize = outerType;
      sel = self;
    }

    if (typeof bufferSize === "undefined")
      bufferSize = 1;
    if (bufferSize === "all")
      bufferSize = -1;

    var originalOne = self.one;
    $.each(["bind", "one"], function (_, nm)
    {
      var originalFn = self[nm];
      self[nm] = function(type, data, fn)
      {
        if (typeof type === "object")
        {
          for (var key in type)
            self[nm].call(self, key, data, type[key], fn);

          return self;
        }

        if ($.isFunction(data) || data === false)
        {
          fn = data;
          data = undefined;
        }

        var buffer = [];
        var handler = function ()
        {
          buffer.push(arguments);
          if (bufferSize > 0 && buffer.length > bufferSize)
            buffer.shift();
        }
        originalFn.call(self, type, data, handler);

        originalOne.call(sel, outerType, function ()
        {
          self.unbind(type, handler);
          originalFn.call(self, type, data, fn);

          $(buffer).each(function (_, args)
          {
            fn.apply(self, args);
          });
          buffer = null;
        });

        return self;
      };
    });

    return self;
  };


  $.fn.delayFor = function(milliSeconds)
  {
    var self = $(this);

    $.each(["bind", "one"], function (_, nm)
    {
      var originalFn = self[nm];
      self[nm] = function(type, data, fn)
      {
        if (typeof type === "object")
        {
          for (var key in type)
            self[nm].call(self, key, data, type[key], fn);

          return self;
        }

        if ($.isFunction(data) || data === false)
        {
          fn = data;
          data = undefined;
        }

        var handler = function ()
        {
          var args = arguments;

          setTimeout(function ()
          {
            fn.apply(self, args);
          }, milliSeconds);
        }
        originalFn.call(self, type, data, handler);

        return self;
      };
    });

    return self;
  };


  function transpose(xs)
  {
    if (!xs || !xs.length || !xs[0].length) return [];

    var w = xs.length;
    var h = xs[0].length;
    var ys = [];
   
    for (var i = 0; i < h; i++)
    {
      ys[i] = [];
   
      for (var j = 0; j < w; j++)
        ys[i][j] = xs[j][i];
    }
   
    return ys;
  };
})(jQuery);

