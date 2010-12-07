/*!
 * jQuery Event Combinators
 * 
 * Copyright (c) 2010, Tom Lokhorst
 * Released under BSD license, see LICENSE file.
 */

(function ()
{
  jQuery.fn.whenAll = function()
  {
    var self = this;

    jQuery.each(["bind", "one"], function (_, nm)
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
        
        if (jQuery.isFunction(data) || data === false)
        {
          fn = data;
          data = undefined;
        }

        var ln = self.length; // Calculate .length at time of .bind call
  
        var args = [];
        self.each(function (i, o)
        {
          originalFn.call($(o), type, data, function ()
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

    return this;
  };


  jQuery.fn.whenAny = function()
  {
    var self = this;

    var originalOne = this.one;
    this.one = function(type, data, fn)
    {
      if (typeof type === "object")
      {
        for (var key in type)
          this.one(key, data, type[key], fn);

        return self;
      }

      if (jQuery.isFunction(data) || data === false)
      {
        fn = data;
        data = undefined;
      }

      var handler = function (e)
      {
        self.unbind(e, handler);
        return fn.apply(self, arguments);
      }

      originalOne.call(this, type, data, handler);

      return self;
    };

    return this;
  };


  jQuery.fn.ignoreUntil = function(sel, outerType)
  {
    if (typeof sel == "string")
    {
      outerType = sel;
      sel = this;
    }

    var self = this;

    var originalOne = this.one;
    jQuery.each(["bind", "one"], function (_, nm)
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

        if (jQuery.isFunction(data) || data === false)
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

    return this;
  };


  jQuery.fn.ignoreAfter = function(sel, outerType)
  {
    if (typeof sel == "string")
    {
      outerType = sel;
      sel = this;
    }

    var self = this;

    var originalOne = this.one;
    jQuery.each(["bind", "one"], function (_, nm)
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

        if (jQuery.isFunction(data) || data === false)
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

    return this;
  };


  jQuery.each(["bind", "one"], function (_, nm)
  {
    var originalFn = jQuery.fn[nm];
    jQuery.fn[nm + "All"] = function(types, data, fn)
    {
      if (jQuery.isFunction(data) || data === false)
      {
        fn = data;
        data = undefined;
      }

      var self = this;
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

      return this;
    };
  });


  jQuery.each(["bind", "one"], function (_, nm)
  {
    var originalFn = jQuery.fn[nm];
    jQuery.fn[nm + "Both"] = function(type1, type2, data, fn)
    {
      if (jQuery.isFunction(data) || data === false)
      {
        fn = data;
        data = undefined;
      }

      var self = this;
      this[nm + "All"]([type1, type2], data, function()
      {
        var args = transpose(arguments);
        fn.apply(self, args[0].concat(args[1]));
      });

      return this;
    };
  });


  jQuery.fn.replayAfter = function(sel, outerType, bufferSize)
  {
    if (typeof sel == "string")
    {
      outerType = sel;
      bufferSize = outerType;
      sel = this;
    }

    if (bufferSize == undefined)
      bufferSize = 1;
    if (bufferSize == "all")
      bufferSize = -1;

    var self = this;

    var originalOne = this.one;
    jQuery.each(["bind", "one"], function (_, nm)
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

        if (jQuery.isFunction(data) || data === false)
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

    return this;
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
})();

