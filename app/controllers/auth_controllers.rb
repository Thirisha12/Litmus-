# app/controllers/auth_controller.rb

class AuthController < ApplicationController
    # Handle user authentication (login and signup) requests
  
    # POST /auth/login
    def login
      user = User.find_by(email: params[:email])
  
      if user && user.valid_password?(params[:password])
        render json: { message: 'Login successful', user: user }, status: :ok
      else
        render json: { error: 'Invalid email or password' }, status: :unauthorized
      end
    end
  
    # POST /auth/signup
    def signup
      user = User.new(user_params)
  
      if user.save
        render json: { message: 'Signup successful', user: user }, status: :created
      else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    private
  
    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation)
    end
  end
  
