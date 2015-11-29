module OSOM

  class Warning

    DEF_TITLE_FIRE = 'Advice - Fire'
    DEF_CATEGORY = 'Warnings'

    attr_reader :id
    attr_reader :title
    attr_reader :location
    attr_reader :category

    def initialize(id, title, location, category)
        @id = id
        @title = title
        @location = location
        @category = category
    end

    def self.fire_advice
      return Warning.new '#/incident/1544167/warning/19056730', 'Advice - Building Fire', 'Portland, Portland North, Portland West', DEF_CATEGORY
    end

  end

end
