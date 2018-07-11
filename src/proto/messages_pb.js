/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.messages.ARAid', null, global);
goog.exportSymbol('proto.messages.Agreement', null, global);
goog.exportSymbol('proto.messages.Quote', null, global);
goog.exportSymbol('proto.messages.SOW', null, global);
goog.exportSymbol('proto.messages.Signature', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.messages.SOW = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.messages.SOW, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.messages.SOW.displayName = 'proto.messages.SOW';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.messages.SOW.prototype.toObject = function(opt_includeInstance) {
  return proto.messages.SOW.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.messages.SOW} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.SOW.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, 0),
    workUnit: jspb.Message.getFieldWithDefault(msg, 2, ""),
    requester: (f = msg.getRequester()) && proto.messages.ARAid.toObject(includeInstance, f),
    data: msg.getData_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.messages.SOW}
 */
proto.messages.SOW.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.messages.SOW;
  return proto.messages.SOW.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.messages.SOW} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.messages.SOW}
 */
proto.messages.SOW.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setWorkUnit(value);
      break;
    case 3:
      var value = new proto.messages.ARAid;
      reader.readMessage(value,proto.messages.ARAid.deserializeBinaryFromReader);
      msg.setRequester(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setData(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.messages.SOW.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.messages.SOW.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.messages.SOW} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.SOW.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getWorkUnit();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getRequester();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.messages.ARAid.serializeBinaryToWriter
    );
  }
  f = message.getData_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      4,
      f
    );
  }
};


/**
 * optional int32 id = 1;
 * @return {number}
 */
proto.messages.SOW.prototype.getId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.messages.SOW.prototype.setId = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional string work_unit = 2;
 * @return {string}
 */
proto.messages.SOW.prototype.getWorkUnit = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.messages.SOW.prototype.setWorkUnit = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional ARAid requester = 3;
 * @return {?proto.messages.ARAid}
 */
proto.messages.SOW.prototype.getRequester = function() {
  return /** @type{?proto.messages.ARAid} */ (
    jspb.Message.getWrapperField(this, proto.messages.ARAid, 3));
};


/** @param {?proto.messages.ARAid|undefined} value */
proto.messages.SOW.prototype.setRequester = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.messages.SOW.prototype.clearRequester = function() {
  this.setRequester(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.SOW.prototype.hasRequester = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional bytes data = 4;
 * @return {!(string|Uint8Array)}
 */
proto.messages.SOW.prototype.getData = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * optional bytes data = 4;
 * This is a type-conversion wrapper around `getData()`
 * @return {string}
 */
proto.messages.SOW.prototype.getData_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getData()));
};


/**
 * optional bytes data = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getData()`
 * @return {!Uint8Array}
 */
proto.messages.SOW.prototype.getData_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getData()));
};


/** @param {!(string|Uint8Array)} value */
proto.messages.SOW.prototype.setData = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.messages.Quote = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.messages.Quote, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.messages.Quote.displayName = 'proto.messages.Quote';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.messages.Quote.prototype.toObject = function(opt_includeInstance) {
  return proto.messages.Quote.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.messages.Quote} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.Quote.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, 0),
    perUnitCost: jspb.Message.getFieldWithDefault(msg, 2, 0),
    sow: (f = msg.getSow()) && proto.messages.SOW.toObject(includeInstance, f),
    farmer: (f = msg.getFarmer()) && proto.messages.ARAid.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.messages.Quote}
 */
proto.messages.Quote.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.messages.Quote;
  return proto.messages.Quote.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.messages.Quote} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.messages.Quote}
 */
proto.messages.Quote.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPerUnitCost(value);
      break;
    case 3:
      var value = new proto.messages.SOW;
      reader.readMessage(value,proto.messages.SOW.deserializeBinaryFromReader);
      msg.setSow(value);
      break;
    case 4:
      var value = new proto.messages.ARAid;
      reader.readMessage(value,proto.messages.ARAid.deserializeBinaryFromReader);
      msg.setFarmer(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.messages.Quote.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.messages.Quote.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.messages.Quote} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.Quote.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getPerUnitCost();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getSow();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.messages.SOW.serializeBinaryToWriter
    );
  }
  f = message.getFarmer();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.messages.ARAid.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 id = 1;
 * @return {number}
 */
proto.messages.Quote.prototype.getId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.messages.Quote.prototype.setId = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional int32 per_unit_cost = 2;
 * @return {number}
 */
proto.messages.Quote.prototype.getPerUnitCost = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.messages.Quote.prototype.setPerUnitCost = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional SOW sow = 3;
 * @return {?proto.messages.SOW}
 */
proto.messages.Quote.prototype.getSow = function() {
  return /** @type{?proto.messages.SOW} */ (
    jspb.Message.getWrapperField(this, proto.messages.SOW, 3));
};


/** @param {?proto.messages.SOW|undefined} value */
proto.messages.Quote.prototype.setSow = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.messages.Quote.prototype.clearSow = function() {
  this.setSow(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.Quote.prototype.hasSow = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional ARAid farmer = 4;
 * @return {?proto.messages.ARAid}
 */
proto.messages.Quote.prototype.getFarmer = function() {
  return /** @type{?proto.messages.ARAid} */ (
    jspb.Message.getWrapperField(this, proto.messages.ARAid, 4));
};


/** @param {?proto.messages.ARAid|undefined} value */
proto.messages.Quote.prototype.setFarmer = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.messages.Quote.prototype.clearFarmer = function() {
  this.setFarmer(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.Quote.prototype.hasFarmer = function() {
  return jspb.Message.getField(this, 4) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.messages.Agreement = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.messages.Agreement, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.messages.Agreement.displayName = 'proto.messages.Agreement';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.messages.Agreement.prototype.toObject = function(opt_includeInstance) {
  return proto.messages.Agreement.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.messages.Agreement} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.Agreement.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, 0),
    quote: (f = msg.getQuote()) && proto.messages.Quote.toObject(includeInstance, f),
    requesterSignature: (f = msg.getRequesterSignature()) && proto.messages.Signature.toObject(includeInstance, f),
    farmerSignature: (f = msg.getFarmerSignature()) && proto.messages.Signature.toObject(includeInstance, f),
    data: msg.getData_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.messages.Agreement}
 */
proto.messages.Agreement.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.messages.Agreement;
  return proto.messages.Agreement.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.messages.Agreement} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.messages.Agreement}
 */
proto.messages.Agreement.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setId(value);
      break;
    case 2:
      var value = new proto.messages.Quote;
      reader.readMessage(value,proto.messages.Quote.deserializeBinaryFromReader);
      msg.setQuote(value);
      break;
    case 3:
      var value = new proto.messages.Signature;
      reader.readMessage(value,proto.messages.Signature.deserializeBinaryFromReader);
      msg.setRequesterSignature(value);
      break;
    case 4:
      var value = new proto.messages.Signature;
      reader.readMessage(value,proto.messages.Signature.deserializeBinaryFromReader);
      msg.setFarmerSignature(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setData(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.messages.Agreement.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.messages.Agreement.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.messages.Agreement} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.Agreement.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getQuote();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.messages.Quote.serializeBinaryToWriter
    );
  }
  f = message.getRequesterSignature();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.messages.Signature.serializeBinaryToWriter
    );
  }
  f = message.getFarmerSignature();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.messages.Signature.serializeBinaryToWriter
    );
  }
  f = message.getData_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
};


/**
 * optional int64 id = 1;
 * @return {number}
 */
proto.messages.Agreement.prototype.getId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.messages.Agreement.prototype.setId = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional Quote quote = 2;
 * @return {?proto.messages.Quote}
 */
proto.messages.Agreement.prototype.getQuote = function() {
  return /** @type{?proto.messages.Quote} */ (
    jspb.Message.getWrapperField(this, proto.messages.Quote, 2));
};


/** @param {?proto.messages.Quote|undefined} value */
proto.messages.Agreement.prototype.setQuote = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.messages.Agreement.prototype.clearQuote = function() {
  this.setQuote(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.Agreement.prototype.hasQuote = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional Signature requester_signature = 3;
 * @return {?proto.messages.Signature}
 */
proto.messages.Agreement.prototype.getRequesterSignature = function() {
  return /** @type{?proto.messages.Signature} */ (
    jspb.Message.getWrapperField(this, proto.messages.Signature, 3));
};


/** @param {?proto.messages.Signature|undefined} value */
proto.messages.Agreement.prototype.setRequesterSignature = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.messages.Agreement.prototype.clearRequesterSignature = function() {
  this.setRequesterSignature(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.Agreement.prototype.hasRequesterSignature = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional Signature farmer_signature = 4;
 * @return {?proto.messages.Signature}
 */
proto.messages.Agreement.prototype.getFarmerSignature = function() {
  return /** @type{?proto.messages.Signature} */ (
    jspb.Message.getWrapperField(this, proto.messages.Signature, 4));
};


/** @param {?proto.messages.Signature|undefined} value */
proto.messages.Agreement.prototype.setFarmerSignature = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.messages.Agreement.prototype.clearFarmerSignature = function() {
  this.setFarmerSignature(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.Agreement.prototype.hasFarmerSignature = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional bytes data = 5;
 * @return {!(string|Uint8Array)}
 */
proto.messages.Agreement.prototype.getData = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes data = 5;
 * This is a type-conversion wrapper around `getData()`
 * @return {string}
 */
proto.messages.Agreement.prototype.getData_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getData()));
};


/**
 * optional bytes data = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getData()`
 * @return {!Uint8Array}
 */
proto.messages.Agreement.prototype.getData_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getData()));
};


/** @param {!(string|Uint8Array)} value */
proto.messages.Agreement.prototype.setData = function(value) {
  jspb.Message.setField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.messages.Signature = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.messages.Signature, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.messages.Signature.displayName = 'proto.messages.Signature';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.messages.Signature.prototype.toObject = function(opt_includeInstance) {
  return proto.messages.Signature.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.messages.Signature} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.Signature.toObject = function(includeInstance, msg) {
  var f, obj = {
    araId: (f = msg.getAraId()) && proto.messages.ARAid.toObject(includeInstance, f),
    data: msg.getData_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.messages.Signature}
 */
proto.messages.Signature.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.messages.Signature;
  return proto.messages.Signature.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.messages.Signature} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.messages.Signature}
 */
proto.messages.Signature.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.messages.ARAid;
      reader.readMessage(value,proto.messages.ARAid.deserializeBinaryFromReader);
      msg.setAraId(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setData(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.messages.Signature.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.messages.Signature.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.messages.Signature} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.Signature.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAraId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.messages.ARAid.serializeBinaryToWriter
    );
  }
  f = message.getData_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional ARAid ara_id = 1;
 * @return {?proto.messages.ARAid}
 */
proto.messages.Signature.prototype.getAraId = function() {
  return /** @type{?proto.messages.ARAid} */ (
    jspb.Message.getWrapperField(this, proto.messages.ARAid, 1));
};


/** @param {?proto.messages.ARAid|undefined} value */
proto.messages.Signature.prototype.setAraId = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.messages.Signature.prototype.clearAraId = function() {
  this.setAraId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.messages.Signature.prototype.hasAraId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes data = 2;
 * @return {!(string|Uint8Array)}
 */
proto.messages.Signature.prototype.getData = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes data = 2;
 * This is a type-conversion wrapper around `getData()`
 * @return {string}
 */
proto.messages.Signature.prototype.getData_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getData()));
};


/**
 * optional bytes data = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getData()`
 * @return {!Uint8Array}
 */
proto.messages.Signature.prototype.getData_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getData()));
};


/** @param {!(string|Uint8Array)} value */
proto.messages.Signature.prototype.setData = function(value) {
  jspb.Message.setField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.messages.ARAid = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.messages.ARAid, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.messages.ARAid.displayName = 'proto.messages.ARAid';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.messages.ARAid.prototype.toObject = function(opt_includeInstance) {
  return proto.messages.ARAid.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.messages.ARAid} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.ARAid.toObject = function(includeInstance, msg) {
  var f, obj = {
    did: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.messages.ARAid}
 */
proto.messages.ARAid.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.messages.ARAid;
  return proto.messages.ARAid.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.messages.ARAid} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.messages.ARAid}
 */
proto.messages.ARAid.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setDid(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.messages.ARAid.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.messages.ARAid.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.messages.ARAid} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.messages.ARAid.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDid();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string did = 1;
 * @return {string}
 */
proto.messages.ARAid.prototype.getDid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.messages.ARAid.prototype.setDid = function(value) {
  jspb.Message.setField(this, 1, value);
};


goog.object.extend(exports, proto.messages);
