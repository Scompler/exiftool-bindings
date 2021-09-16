# frozen_string_literal: true

require 'rails'
require 'snake_case'

module ExiftoolBindings #:nodoc:
  String.include ExiftoolBindings::CoreExtensions::SnakeCase

  class Railtie < ::Rails::Railtie #:nodoc:
    initializer 'rails-i18n' do
      ExiftoolBindings::Railtie.instance_eval do
        I18n.load_path.concat(
          Dir[File.join(File.dirname(__FILE__), '../yml/translations.yml')]
        )
      end
    end
  end

  %i[xmp iptc exif].each do |section|
    const_set(
      section.upcase,
      MultiJson.load(
        File.read(File.join(File.dirname(__FILE__), "../json/#{section}.json")),
        symbolize_keys: true
      )
    )
  end
end
