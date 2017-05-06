/* Wrapper for accessing strings through sequential reads */
function Stream( arrInt8) {
	var position = 0;
	
	function read(length, encoding) {
		var result = arrInt8.slice(position, position + length);
		position += length;
        if( encoding && TextDecoder){
            return new TextDecoder(encoding).decode(result);
        }
		return result;
	}
	
	/* read a big-endian 32-bit integer */
	function readInt32() {
		var result =
			( arrInt8[position] << 24)
			+ (arrInt8[position + 1] << 16)
			+ (arrInt8[position + 2] << 8)
			+ (arrInt8[position + 3]);
		position += 4;
		return result;
	}

	/* read a big-endian 16-bit integer */
	function readInt16() {
		var result = 
			(arrInt8[position] << 8)
			+ ( arrInt8[position + 1]);
		position += 2;
		return result;
	}
	
	/* read an 8-bit integer */
	function readInt8(signed) {
        var result = arrInt8[position];
		if (signed && result > 127) result -= 256;
		position += 1;
		return result;
	}
	
	function eof() {
		return position >= arrInt8.length;
	}
	
	/* read a MIDI-style variable-length integer
		(big-endian value in groups of 7 bits,
		with top bit set to signify that another byte follows)
	*/
	function readVarInt() {
		var result = 0;
		while (true) {
			var b = readInt8();
			if (b & 0x80) {
				result += (b & 0x7f);
				result <<= 7;
			} else {
				/* b is the last byte */
				return result + b;
			}
		}
	}
	
	return {
		'eof': eof,
		'read': read,
		'readInt32': readInt32,
		'readInt16': readInt16,
		'readInt8': readInt8,
		'readVarInt': readVarInt
	}
}
