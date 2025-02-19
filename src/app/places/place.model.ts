/**
 * Represents a place with an ID, title, image, and geographical coordinates.
 */
export interface Place {
  /**
   * Unique identifier for the place.
   */
  id: string;

  /**
   * Title or name of the place.
   */
  title: string;

  /**
   * Image associated with the place.
   */
  image: {
    /**
     * Source URL of the image.
     */
    src: string;

    /**
     * Alternative text for the image.
     */
    alt: string;
  };

  /**
   * Latitude coordinate of the place.
   */
  lat: number;

  /**
   * Longitude coordinate of the place.
   */
  lon: number;
}
