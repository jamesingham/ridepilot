class MonthliesController < ApplicationController
  load_and_authorize_resource

  def new
  end

  def index

  end

  def edit
  end

  def update
    @monthly.update_attributes(params[:monthly])
    @monthly.save!
    flash[:notice] = "Monthly report updated"
    redirect_to :action=>:index
  end

  def create
    @monthly.provider = current_provider
    @monthly.save!
    flash[:notice] = "Monthly report created"
    redirect_to :action=>:index
  end

end
