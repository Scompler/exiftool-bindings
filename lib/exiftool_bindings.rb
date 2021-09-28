# frozen_string_literal: true

require 'rails'
require 'snake_case'

module ExiftoolBindings #:nodoc:
  SECTIONS = %i[xmp iptc exif].freeze

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

  SECTIONS.each do |section|
    const_set(
      section.upcase,
      MultiJson.load(
        File.read(File.join(File.dirname(__FILE__), "../json/#{section}.json")),
        symbolize_keys: true
      )
    )
  end

  EXTENSIONS = MultiJson.load(
    File.read(File.join(File.dirname(__FILE__), '../json/extensions.json')),
    symbolize_keys: true
  )

  def self.writable_sections(extension)
    extension.downcase!
    return SECTIONS if EXTENSIONS[:all].include? extension

    SECTIONS.find_all do |section|
      EXTENSIONS[section][:write].include? extension
    end
  end

  def self.readable_sections(extension)
    (
      SECTIONS.find_all do |section|
        EXTENSIONS[section][:read].include? extension
      end + writable_sections(extension)
    ).uniq
  end
end
