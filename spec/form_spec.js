Screw.Unit(function() {
  describe("Disco.Form", function() {
    var view, model, element;
    
    before(function() {
      model = { name: 'Dumbo' };
    });
    
    var render_form_and_assign_element = function(options) {
      var form_content = options.form_content;

      var element_selector = options.element_selector || null;
      var preload_model = options.preload_model || null;
      var configuration = options.configuration || {};
      var methods = options.methods || {};

      var inheriting_template = {
        form_content: function(builder, initial_attributes) {
          with(builder) {
            form_content(builder);
          }
        },
        configuration: configuration,
        methods: methods
      }

      var template = Disco.inherit(Disco.Form, inheriting_template);

      if (preload_model) {
        view = Disco.build(template, { model: preload_model });
      } else {
        view = Disco.build(template);
      }

      if(element_selector) {
        element = view.find(element_selector);
      }
    }

    describe("methods on the builder passed to the form_content function", function() {
      describe("#messages_for", function() {
        before(function() {
          model.errors = {'type': "can't be blank", 'name': "can't be Dumbo", 'foobar': "you fool! foobar can't be bad!"};

          render_form_and_assign_element({
            form_content: function(builder) {
              with(builder) {
                messages_for('errors');
                input_for('name');
                input_for('type');
              }
            },
            element_selector: 'ul#model_errors'
          });
        });

        describe("when passed a model attribute name", function() {
          describe("the emitted ul tag", function() {
            describe("when the configuration does not include constructor_name", function() {
              it("has @id composed of 'model' and the attribute name", function() {
                expect(element.attr('id')).to(equal, 'model_errors');
              });

              it("has @class equal to 'messages' + the attribute name", function() {
                expect(element.attr('class')).to(equal, 'messages errors');
              });

              it("is hidden", function() {
                expect(view.find('ul#model_errors:hidden').length).to(equal, 1);
              });
            });
            
            describe("when the configuration includes constructor_name", function() {
              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      messages_for('errors');
                      input_for('name');
                      input_for('type');
                    }
                  },
                  element_selector: 'ul#animal_errors',
                  configuration: { constructor_name: 'Animal' }
                });
              });

              it("has @id composed of the constructor_name and the attribute name", function() {
                expect(element.attr('id')).to(equal, 'animal_errors');
              });
            });
          });
        });
        
        describe("when #load is called on the view", function() {
          before(function() {
            view.model = model;
            view.load();
          });
          
          describe("the form", function() {
            it("receives a class with the message name", function() {
              expect(view.hasClass('error')).to(equal, true);
            })
          });

          describe("the message list", function() {
            it("receives an li tag for each message, ordered by field appearance", function() {
              var items = element.find('li');
              expect(items.length).to(equal, 3);
              expect(items.eq(0).html()).to(equal, "Name can't be Dumbo");
              expect(items.eq(1).html()).to(equal, "Type can't be blank");
            });

            it("receives an li tag for each message that does not match a form field", function() {
              var items = element.find('li');
              expect(items.eq(2).html()).to(equal, "you fool! foobar can't be bad!");
            });

            it("is made visible", function() {
              expect(view.find('ul#model_errors:visible').length).to(equal, 1);
            });
          });

          describe("each form field associated with a message", function() {
            it("receives a class with the message name", function() {
              expect(view.find('input#model_name').hasClass('error')).to(equal, true);
              expect(view.find('input#model_type').hasClass('error')).to(equal, true);
            });
          });
        });
        
        describe("when #save is called on the view", function() {
          before(function() {
            view.model = model;
            view.load();
          });

          describe("the form", function() {
            it("is cleared of message class", function() {
              expect(view.hasClass('error')).to(equal, true);
              view.save();
              expect(view.hasClass('error')).to(equal, false);
            });
          });
          
          describe("the message list", function() {
            it("is cleared of any messages", function() {
              expect(element.find('li').length).to(equal, 3);
              view.save();
              expect(element.find('li').length).to(equal, 0);
            });

            it("is made hidden", function() {
              expect(view.find('ul#model_errors:hidden').length).to(equal, 0);
              expect(view.find('ul#model_errors:visible').length).to(equal, 1);
              view.save();
              expect(view.find('ul#model_errors:hidden').length).to(equal, 1);
              expect(view.find('ul#model_errors:visible').length).to(equal, 0);
            });
          });
          
          describe("each form field associated with a message", function() {
            it("is cleared of any message class", function() {
              expect(view.find('input#model_name').hasClass('error')).to(equal, true);
              view.save();
              expect(view.find('input#model_name').hasClass('error')).to(equal, false);
            });
          });
          
          describe("the model", function() {
            it("is cleared of the message attribute", function() {
              expect(model.errors).to_not(equal, undefined);
              view.save();
              expect(model.errors).to(equal, undefined);
            });
          });
        });
      });
      
      describe("#label_for", function() {
        describe("when passed a model attribute name", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  label_for('name');
                }
              },
              element_selector: 'label[for=model_name]'
            });
          });

          describe("the emitted label tag", function() {
            describe("when the configuration does not include constructor_name", function() {
              it("has @for composed of 'model' and the attribute name", function() {
                expect(element.attr('for')).to(equal, 'model_name');
              });
            });

            describe("when the configuration includes constructor_name", function() {
              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      label_for('name');
                    }
                  },
                  element_selector: 'label[for=animal_name]',
                  configuration: { constructor_name: 'Animal' }
                });
              });

              it("has @for composed of constructor_name and the attribute name", function() {
                expect(element.attr('for')).to(equal, 'animal_name');
              });
            });
          });
        });
        
        describe("when passed a model attribute name and html_attributes", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  label_for('name', { 'class': 'custom_class' });
                }
              },
              element_selector: 'label[for=model_name]'
            });
          });

          describe("the emitted label tag", function() {
            it("includes the given html_attributes", function() {
              expect(element.attr('class')).to(equal, 'custom_class');
            });

            describe("when the configuration includes constructor_name", function() {
              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      label_for('name');
                    }
                  },
                  element_selector: 'label[for=animal_name]',
                  configuration: { constructor_name: 'Animal' }
                });
              });

              it("has @for composed of constructor_name and the attribute name", function() {
                expect(element.attr('for')).to(equal, 'animal_name');
              });
            });
          });
        });
      });
      
      describe("#input_for", function() {
        describe("when passed a model attribute name", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                }
              },
              element_selector: 'input#model_name'
            });
          });

          describe("the emitted input tag", function() {
            describe("when the configuration does not include constructor_name", function() {
              it("has @id composed of 'model' and the attribute name", function() {
                expect(element.attr('id')).to(equal, 'model_name');
              });

              it("has @name composed of 'model' and then attribute name", function() {
                expect(element.attr('name')).to(equal, 'model[name]');
              });

              it("has @type defaulted to 'text", function() {
                expect(element.attr('type')).to(equal, 'text');
              });
            });

            describe("when the configuration includes constructor_name", function() {
              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      input_for('name');
                    }
                  },
                  element_selector: 'input#animal_name',
                  configuration: { constructor_name: 'Animal' }
                });
              });

              it("has @id composed of constructor_name and the attribute name", function() {
                expect(element.attr('id')).to(equal, 'animal_name');
              });

              it("has @name composed of constructor_name and the attribute name", function() {
                expect(element.attr('name')).to(equal, 'animal[name]');
              });
            });
          });
        });
        
        describe("when passed a model attribute name and html_attributes", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name', { 'type': 'hidden', 'class': 'custom_class' });
                }
              },
              element_selector: 'input#model_name'
            });
          });
          
          describe("the emitted input tag", function() {
            it("includes the given html_attributes", function() {
              expect(element.attr('type')).to(equal, 'hidden');
              expect(element.attr('class')).to(equal, 'custom_class');
            });
          });
        });

        describe("when #load is called on the view", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                  input_for('mood');
                }
              }
            });
          });

          describe("when the model's attribute has a value", function() {
            before(function() {
              expect(model.name).to(equal, 'Dumbo');
              element = view.find('input#model_name');
            });
            
            it("sets the input@value with the value of the model's attribute", function() {
              expect(element.val()).to(equal, "");
              view.model = model;
              view.load();
              expect(element.val()).to(equal, 'Dumbo');
            });
          });

          describe("when the model's attribute does not have a value", function() {
            before(function() {
              expect(model.mood).to(equal, undefined);
              element = view.find('input#model_mood');
            });

            it("sets the input@value to empty string", function() {
              expect(element.val()).to(equal, "");
              view.model = model;
              view.load();
              expect(element.val()).to(equal, "");
            });
          });
        });

        describe("when #save is called on the view", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                }
              },
              element_selector: 'input#model_name',
              preload_model: model
            });
          });

          it("stores input element values in the view's #model", function() {
            var new_model_name = "Elephant";
            element.val(new_model_name);
            expect(model.name).to(equal, "Dumbo");
            view.save();
            expect(model.name).to(equal, new_model_name);
          });
        });
      });
      
      describe("#select_for", function() {
        describe("when passed a model attribute name", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  select_for('type');
                }
              },
              element_selector: 'select#model_type'
            });
          });

          describe("the emitted select tag", function() {
            describe("when the configuration does not include constructor_name", function() {
              it("has @id composed of 'model' and the attribute name", function() {
                expect(element.length).to(equal, 1);
                expect(element.attr('id')).to(equal, 'model_type');
              });

              it("has @name composed of 'model' and the attribute name", function() {
                expect(element.length).to(equal, 1);
                expect(element.attr('name')).to(equal, 'model[type]');
              });
              
            });
            
            describe("when the configuration includes constructor_name", function() {
              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      select_for('type', {'class': 'custom_class'}, function() {
                        option('Elephant');
                        option('Donkey');
                      });
                    }
                  },
                  element_selector: 'select#animal_type',
                  configuration: { constructor_name: 'Animal' }
                });
              });

              it("has @id composed of constructor_name and the attribute name", function() {
                expect(element.attr('id')).to(equal, 'animal_type');
              });

              it("has @name composed of constructor_name and the attribute name", function() {
                expect(element.attr('name')).to(equal, 'animal[type]');
              });
            });
          });
        });

        describe("when passed a model attribute name and html_attributes", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  select_for('type', {'class': 'custom_class'});
                }
              },
              element_selector: 'select#model_type'
            });
          });

          describe("the emitted select tag", function() {
            it("includes the given html_attributes", function() {
              expect(element.attr('class')).to(equal, 'custom_class');
            });
          });
        });

        describe("when passed a model attribute name and a function", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  select_for('type', function() {
                    option('Elephant');
                    option('Donkey');
                  });
                }
              },
              element_selector: 'select#model_type'
            });
          });

          describe("the emitted select tag", function() {
            it("invokes the function to generate option elements", function() {
              expect(element.find('option').length).to(equal, 2);
            });
          });
        });

        describe("when passed a model attribute name, html_attributes and a function", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  select_for('type', {'class': 'custom_class'}, function() {
                    option('Elephant');
                    option('Donkey');
                  });
                }
              },
              element_selector: 'select#model_type'
            });
          });

          describe("the emitted select tag", function() {
            it("includes the given html_attributes and invokes the function to generate option elements", function() {
              expect(element.attr('class')).to(equal, 'custom_class');
              expect(element.find('option').length).to(equal, 2);
            });
          });
        });

        describe("when #load is called on the view", function() {
          before(function() {
            model.number = 'two';
            
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  select_for('number', function() {
                    option('one');
                    option('two');
                  });

                  select_for('color', function() {
                    option('red');
                    option('orange');
                    option('yellow');
                  });
                }
              }
            });
          });

          describe("when the model's attribute has a value", function() {
            before(function() {
              expect(model.number).to(equal, 'two');
              element = view.find('select#model_number');
            });

            it("selects the option matching the model's attribute value", function() {
              expect(element.val()).to(equal, 'one');
              view.model = model;
              view.load();
              expect(element.val()).to(equal, 'two');
            });
          });

          describe("when the model's attribute does not have a value", function() {
            before(function() {
              expect(model.color).to(equal, undefined);
              element = view.find('select#model_color');
            });

            it("selects the first option", function() {
              expect(element.val()).to(equal, 'red');
              view.model = model;
              view.load();
              expect(element.val()).to(equal, 'red');
            });
          });
        });
        
        describe("when #save is called on the view", function() {
          before(function() {
            model.number = 'one'

            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  select_for('number', function() {
                    option('one');
                    option('two');
                  });
                }
              },
              element_selector: 'select#model_number',
              preload_model: model
            });
          });

          it("stores the selected option in the view's #model", function() {
            var new_number = "two";
            element.val(new_number);
            expect(model.number).to(equal, "one");
            view.save();
            expect(model.number).to(equal, new_number);
          });
        });
      });
      
      describe("#action_button", function() {
        describe("when passed the button text and action", function() {
          describe("the emitted input[@type=button] tag", function() {
            describe("when the configuration does not include constructor_name", function() {
              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      action_button('Save animal', 'save')
                    }
                  },
                  element_selector: 'input#model_button_save'
                });
              });
              
              it("has @id composed of 'model' and the action", function() {
                expect(element.length).to(equal, 1);
                expect(element.attr('id')).to(equal, 'model_button_save');
              });
              
              it("has @name composed of 'model' and the action", function() {
                expect(element.attr('name')).to(equal, 'model[button][save]');
              });
            });

            describe("when the configuration includes constructor_name", function() {
              var original_action;
              var called = false;

              before(function() {
                render_form_and_assign_element({
                  form_content: function(builder) {
                    with(builder) {
                      action_button('Save animal', 'save')
                    }
                  },
                  element_selector: 'input#animal_button_save',
                  configuration: { constructor_name: 'Animal' }
                });

                original_action = view.save;
                view.save = function() {
                  called = true;
                };
              });

              after(function() {
                view.save = original_action;
              });

              it("has @id composed of model name and the action", function() {
                expect(element.length).to(equal, 1);
                expect(element.attr('id')).to(equal, 'animal_button_save');
              });

              it("has @name composed of model name and action", function() {
                expect(element.attr('name')).to(equal, 'animal[button][save]');
              });

              it("has @type equal to 'button'", function() {
                expect(element.attr('type')).to(equal, 'button');
              });

              it("has @value equal to the text", function() {
                expect(element.attr('value')).to(equal, 'Save animal');
              });

              it("when clicked, executes the associated action", function() {
                element.click();
                expect(called).to(equal, true);
              });
            });
          });
        });

        describe("when passed the button text, action, and html_attributes", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  action_button('Save animal', 'save', {class: 'custom_class'})
                }
              },
              element_selector: 'input#model_button_save'
            });
          });

          describe("the emitted input[@type=button] tag", function() {
            it("includes the given html_attributes", function() {
              expect(element.attr('class')).to(equal, 'custom_class');
            });
          });
        });
      });
    });
    
    describe("#after_initialize", function() {
      describe("when initial_attributes includes a model", function() {
        before(function() {
          render_form_and_assign_element({
            form_content: function(builder) {
              with(builder) {
                input_for('name');
              }
            },
            preload_model: model,
            element_selector: 'input#model_name'
          });
        });
        
        it("calls #load", function() {
          expect(element.val()).to(equal, 'Dumbo');
        });
      });
      
      describe("when initial_attributes does not include a model", function() {
        before(function() {
          render_form_and_assign_element({
            form_content: function(builder) {
              with(builder) {
                input_for('name');
              }
            },
            element_selector: 'input#model_name'
          });
        });
        
        it("does not call #load", function() {
          expect(element.val()).to(equal, '');
          view.model = model;
          view.load();
          expect(element.val()).to(equal, 'Dumbo');
        });
      });
    });
    
    describe("#load", function() {
      describe("when the form has #load callbacks", function() {
        var load_callback = function() {
          model.name = 'Sherekahn';
        };

        describe("#before_load", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                }
              },
              element_selector: 'input#model_name',
              methods: { 
                before_load: load_callback
              }
            });
          });

          it("fires the #before_load callback before load", function() {
            expect(model.name).to(equal, 'Dumbo');
            expect(element.val()).to(equal, '');
            view.model = model;
            view.load();
            expect(model.name).to(equal, 'Sherekahn');
            expect(element.val()).to(equal, 'Sherekahn');
          });
        });

        describe("#after_load", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                }
              },
              element_selector: 'input#model_name',
              methods: { 
                after_load: load_callback
              }
            });
          });

          it("fires the #after_load callback after load", function() {
            expect(model.name).to(equal, 'Dumbo');
            expect(element.val()).to(equal, '');
            view.model = model;
            view.load();
            expect(model.name).to(equal, 'Sherekahn');
            expect(element.val()).to(equal, 'Dumbo');
          });
        });
      });
    });

    describe("#save", function() {
      describe("when the form has no form fields", function() {
        before(function() {
          render_form_and_assign_element({
            form_content: function(builder) {}
          });
        });
        
        it("successfully saves the form", function() {
          var raised = false;
          try {
            view.save();
          }
          catch(ex) {
            raised = true;
          }
          expect(raised).to(equal, false);
        });
      });
      
      describe("when the form has #save callbacks", function() {
        var save_callback = function() {
          element.val('Sherekahn');
        };

        describe("#before_save", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                }
              },
              element_selector: 'input#model_name',
              preload_model: model,
              methods: {
                before_save: save_callback
              }
            });
          });

          it("fires the before callback, before save", function() {
            expect(model.name).to(equal, 'Dumbo');
            view.save();
            expect(element.val()).to(equal, 'Sherekahn');
            expect(model.name).to(equal, 'Sherekahn')
          });
        });
        
        describe("#after_save", function() {
          before(function() {
            render_form_and_assign_element({
              form_content: function(builder) {
                with(builder) {
                  input_for('name');
                }
              },
              element_selector: 'input#model_name',
              preload_model: model,
              methods: {
                after_save: save_callback
              }
            });
          });

          it("fires the after callback, after save", function() {
            expect(model.name).to(equal, 'Dumbo');
            view.save();
            expect(element.val()).to(equal, 'Sherekahn');
            expect(model.name).to(equal, 'Dumbo')
          });
        });
      });
    });
  });
});