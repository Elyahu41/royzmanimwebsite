﻿// textpopup and hebrew keyboard widgets
// Version: 2.2.3
// dependencies: jQuery UI
// Copyright (c) 2015 Daniel Wachsstock
// MIT license:
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

(function($){
	$.widget('bililite.textpopup', {
		_init: function(){
			var self = this;
			if (this.options.box) this.options.hideOnOutsideClick = false; // never auto-hide for inline boxes
			this._hideOnOutsideClick(this.options.hideOnOutsideClick);
			//this._hideOnEscape(this.options.hideOnOutsideClick);
			// if options.position is an object suitable for passing to $.fn.position (field 'my' is defined) then use it; otherwise use the string shortcuts
			this._position = {
				of: this.element.closest('.card'), // the input element that flexcal was called on
				collision: 'flipfit',
				using: function(to) { $(this).stop(true, false).animate(to, 200) } // animate the repositioning	
			};
			// turn the duration into an array to be used with Function.apply
			this._duration = Array.isArray(this.options.duration) ? this.options.duration : [this.options.duration];
			var trigger = this.options.trigger;
			if (trigger == 'self'){
				trigger = this.element;
			}
			if (this._triggerElement)
				$(trigger).off('.textpopup');
			if (trigger){
				this._triggerElement = $(trigger);
				this._triggerElement.filter(":focusable").bind('focus.textpopup', self.show.bind(self));
				this._triggerElement.filter(":not(:focusable)").bind('click.textpopup', self.show.bind(self));
			}
			// bug inducing note: this._trigger is the function, this._triggerElement is the element
		},
		position: function(){
			if (this.options.box) return; // don't change position for inline boxes
			var display = this._box().css('display');
			this._box().css({display: 'block', visibility: 'hidden'}).
				position(this._position).
				css({display: display, visibility: 'visible'});
		},
		show: function(){
			var self = this, box = self._box().attr('tabindex', 0);
			if (box.is(':visible, :animated')) return;
			self.position();
			self.options.show.apply(box, this._duration);
			box.queue(function(){
				self._trigger('shown');
				box.dequeue()
			});
		},
		hide: function(){
			// having a hidden box with a tabindex bothers the browser to no end
			var self = this, box = self._box().removeAttr('tabindex');
			if (box.is(':hidden')) return;
			self.options.hide.apply(box, this._duration);
			box.queue(function(){self._trigger('hidden'); box.dequeue()});
		},
		_box: function(){
			// lazy create
			return this.theBox || this._createBox();
		},
		widget: function(){
			// for compatibility with the widget factory
			return this._box();
		},
		_createBox: function(){
			var self = this;
			let box;
			if (this.options.box)
				box = $(this.options.box)
			else {
				const boxElem = document.createElement("div");
				boxElem.style.position = "absolute"
				boxElem.style.display = "none";

				document.body.appendChild(boxElem)
				box = $(boxElem)
			}

			box.addClass(this.options['class']).
				on("keydown", function(e) {
					if (e.keyCode == $.ui.keyCode.ESCAPE) {
						self.element.trigger("focus");
						if (self.options.hideOnOutsideClick) self.hide();
					}
				});
			this.theBox = box;
			box.data('textpopup', this);
			this._fill(box);
			this._trigger('create', 0, box);
			return box;
		},
		_fill: function(box){
			// virtual method to put something in the box
		},
		// hides the box for any click outside it. fails for clicks in textboxes, since the click does not bubble up to the body
		_hideOnOutsideClick: function(flag){
			var self = this;
			this._hider = this._hider || function(e){ if(!self._isClickInside(e)) self.hide(); };
			if (flag){
				document.body.addEventListener("click", this._hider);
			} else {
				document.body.removeEventListener("click", this._hider);
			}
		},
		/*_hideOnEscape: function(flag) {
			var self=this;
			this._hiderEsc = this._hiderEsc || function(e){ if (e.keyCode == $.ui.keyCode.ESCAPE) {
				if (this._triggerElement) {
					this._triggerElement.blur()
				}
				self.hide();
			}}
			if (flag){
				document.body.addEventListener("keyup", this._hiderEsc);
			} else {
				document.body.removeEventListener("keyup", this._hiderEsc);
			}
		}, */
		destroy: function() {
			if (!this.options.box) this._box().remove();
			if (this._triggerElement) this._triggerElement.unbind ('.textpopup');
			$('body').off('.textpopup');
			this.theBox = undefined;
		},
		_setOption: function(key, value) {
			this._super(key, value);
			if (key == 'trigger' || 'hideOnOutsideClick' || 'position' || 'duration') this._init;
			if (key == 'class') this._box().attr('class', value);
		},
		// returns true if the event e is a click inside the box , the original element or the triggering elements
		_isClickInside: function(e){
			var keepers = $([]).add(this._triggerElement).add(this._box()).add(this.element);
			for (var elem = e.target; elem; elem = elem.parentNode) if (keepers.index(elem) > -1) return true;
			return false;
		},
		options: {
			box: undefined,
			show: $.fn.show,
			hide: $.fn.hide,
			duration: 'slow',
			hideOnOutsideClick: true,
			trigger: 'self',
			'class': 'ui-textpopup-box'
		}
	});
})(jQuery);
