# db/migrate/YYYYMMDDHHMMSS_create_sample_table.rb

class CreateSampleTable < ActiveRecord::Migration[6.1]
    def change
      create_table :sample_table do |t|
        t.string :name
        t.integer :age
        t.timestamps
      end
    end
  end
  
