require "rails_helper"

RSpec.describe CustomersController, type: :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/customers").to route_to("customers#index")
    end

    it "routes to #new" do
      expect(:get => "/customers/new").to route_to("customers#new")
    end

    it "routes to #show" do
      expect(:get => "/customers/1").to route_to("customers#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/customers/1/edit").to route_to("customers#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/customers").to route_to("customers#create")
    end

    it "routes to #update" do
      expect(:put => "/customers/1").to route_to("customers#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/customers/1").to route_to("customers#destroy", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/customers/1/inactivate").to route_to("customers#inactivate", :customer_id => "1")
    end

    it "routes to #autocomplete" do
      expect(:get => "/customers/autocomplete").to route_to("customers#autocomplete")
    end

    it "routes to #search" do
      expect(:get => "/customers/search").to route_to("customers#search")
    end

    it "routes to #all" do
      expect(:get => "/customers/all").to route_to("customers#all")
    end

    it "routes to #found" do
      expect(:get => "/customers/found").to route_to("customers#found")
    end

  end
end
