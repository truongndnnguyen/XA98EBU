module OSOM

  class Incident

    DEF_TITLE_FIRE = 'Building Fire'
    DEF_SUBTITLE_FIRE = 'Building Fire - Safe'
    DEF_SIZE_SMALL = 'Small'
    DEF_STATUS_SAFE = 'Under Control'
    DEF_CATEGORY = 'Fire'

    attr_reader :id
    attr_reader :title
    attr_reader :subtitle
    attr_reader :status
    attr_reader :location
    attr_reader :size
    attr_reader :category

    def initialize(id, category, title, subtitle, status, location, size)
        @id = id
        @category = category
        @title = title
        @subtitle = subtitle
        @status = status
        @location = location
        @size = size
    end

    def self.fire_incident
      return Incident.new '#/incident/1542734', 'Fire', 'Bushfire', 'Bushfire - Under Control', 'Under Control', '11KM WSW KURNBRUNIN', '13.00 HA.'
    end

    def self.clustered_incident
      return Incident.new '#/incident/1544167', DEF_CATEGORY, DEF_TITLE_FIRE, DEF_SUBTITLE_FIRE, DEF_STATUS_SAFE, 'PORTLAND', DEF_SIZE_SMALL
    end

  end

end
