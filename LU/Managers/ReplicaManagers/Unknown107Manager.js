const GenericManager = require('../GenericManager');
const Components = require('../../Replica/Components');
const SerializationOrder = require('../../Replica/SerializationOrder');
class Unknown107Manager extends GenericManager {
  constructor (server) {
    super(server);

    this._data = {};

    // To fix scoping issues inside of callbacks
    const manager = this;

    /**
     * @param {Object} object
     */
    server.eventBus.on('new-object-created', object => {
      if (object.components.hasComponent(Components.UNKNOWN_107_COMPONENT)) {
        manager._data[object.ID.low] = {};

        object.addSerializer(
          SerializationOrder.indexOf(Components.UNKNOWN_107_COMPONENT),
          (type, stream) => {
            // const data = manager._data[object.ID.low];
            stream.writeBit(false);
          }
        );
      }
    });
  }
}

module.exports = Unknown107Manager;
