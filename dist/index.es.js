class J {
  /**
   * Store a buffer or string and add functionality for random access
   * Unless otherwise noted all read functions advance the file's pointer by the length of the data read
   *
   * @param {Buffer|string} file A file as a string or Buffer to load for random access
   * @param {number} endian Endianess of the file constants BIG_ENDIAN and LITTLE_ENDIAN are provided
   */
  constructor(t, r = 0) {
    this.offset = 0, this.buffer = null, !(r < 0) && (this.bigEndian = r === 0, typeof t == "string" ? this.buffer = Buffer.from(t, "binary") : this.buffer = t, this.bigEndian ? (this.readFloatLocal = this.buffer.readFloatBE.bind(this.buffer), this.readIntLocal = this.buffer.readUIntBE.bind(this.buffer), this.readSignedIntLocal = this.buffer.readIntBE.bind(this.buffer)) : (this.readFloatLocal = this.buffer.readFloatLE.bind(this.buffer), this.readIntLocal = this.buffer.readUIntLE.bind(this.buffer), this.readSignedIntLocal = this.buffer.readIntLE.bind(this.buffer)));
  }
  /**
   * Get buffer length
   *
   * @category Positioning
   * @returns {number}
   */
  getLength() {
    return this.buffer.length;
  }
  /**
   * Get current position in the file
   *
   * @category Positioning
   * @returns {number}
   */
  getPos() {
    return this.offset;
  }
  /**
   * Seek to a provided buffer offset
   *
   * @category Positioning
   * @param {number} position Byte offset
   */
  seek(t) {
    this.offset = t;
  }
  /**
   * Read a string of a specificed length from the buffer
   *
   * @category Data
   * @param {number} length Length of string to read
   * @returns {string}
   */
  readString(t) {
    return this.buffer.toString("utf-8", this.offset, this.offset += t);
  }
  /**
   * Read a float from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readFloat() {
    const t = this.readFloatLocal(this.offset);
    return this.offset += 4, t;
  }
  /**
   * Read a 4-byte unsigned integer from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readInt() {
    const t = this.readIntLocal(this.offset, 4);
    return this.offset += 4, t;
  }
  /**
   * Read a 2-byte unsigned integer from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readShort() {
    const t = this.readIntLocal(this.offset, 2);
    return this.offset += 2, t;
  }
  /**
   * Read a 2-byte signed integer from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readSignedInt() {
    const t = this.readSignedIntLocal(this.offset, 2);
    return this.offset += 2, t;
  }
  /**
   * Read a single byte from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readByte() {
    return this.read();
  }
  // read a set number of bytes from the buffer
  /**
   * Read a set number of bytes from the buffer
   *
   * @category Data
   * @param {number} length Number of bytes to read
   * @returns {number|number[]} number if length = 1, otherwise number[]
   */
  read(t = 1) {
    let r = null;
    return t > 1 ? (r = this.buffer.slice(this.offset, this.offset + t), this.offset += t) : (r = this.buffer[this.offset], this.offset += 1), r;
  }
  /**
   * Advance the pointer forward a set number of bytes
   *
   * @category Positioning
   * @param {number} length Number of bytes to skip
   */
  skip(t) {
    this.offset += t;
  }
}
const Z = 24, ue = 2432, fe = 12, ve = 28, pe = (e, t, r) => {
  const i = e.getPos();
  if (t.record = {
    mseconds: e.readInt(),
    julian_date: e.readShort(),
    unambiguous_range: e.readShort() / 10,
    azimuth: e.readShort() / 8 * 0.043945,
    azimuth_number: e.readShort(),
    radial_status: e.readShort(),
    elevation_angle: e.readShort() / 8 * 0.043945,
    elevation_number: e.readShort(),
    surveillance_range: e.readSignedInt() / 1e3,
    doppler_range: e.readSignedInt() / 1e3,
    surveillance_range_sample_interval: e.readSignedInt() / 1e3,
    doppler_range_sample_interval: e.readSignedInt() / 1e3,
    number_of_surveillance_bins: e.readShort(),
    number_of_doppler_bins: e.readShort(),
    cut_sector_number: e.readShort(),
    calibration_constant: e.readFloat(),
    surveillance_pointer: e.readShort(),
    velocity_pointer: e.readShort(),
    spectral_width_pointer: e.readShort(),
    doppler_velocity_resolution: e.readShort() * 0.25,
    vcp: e.readShort(),
    spare1: e.read(8),
    spare2: e.readShort(),
    spare3: e.readShort(),
    spare4: e.readShort(),
    nyquist_velocity: e.readShort() / 100,
    atoms: e.readShort() / 1e3,
    tover: e.readShort() / 10,
    radial_spot_blanking_status: e.readShort(),
    spare5: e.read(32)
  }, t.record.surveillance_pointer > 0) {
    e.seek(i + t.record.surveillance_pointer);
    try {
      if (e.getPos() > e.getLength()) throw new Error("Message Type 1: Invalid surveillance (reflectivity) offset");
      if (e.getPos() + t.record.number_of_surveillance_bins >= e.getLength()) throw new Error("Message Type 1: Invalid surveillance (reflectivity) length");
      const a = [];
      for (let s = 0; s < t.record.number_of_surveillance_bins; s += 1) {
        const h = e.read();
        h >= 2 ? a.push(h / 2 - 33) : a.push(null);
      }
      t.record.reflect = a;
    } catch (a) {
      r.logger.warn(a.message);
    }
  }
  if (t.record.velocity_pointer > 0) {
    e.seek(i + t.record.velocity_pointer);
    try {
      if (e.getPos() > e.getLength()) throw new Error("Message Type 1: Invalid doppler (velocity) offset");
      if (e.getPos() + t.record.number_of_doppler_bins >= e.getLength()) throw new Error("Message Type 1: Invalid doppler (velocity) length");
      const a = [];
      for (let s = 0; s < t.record.number_of_doppler_bins; s += 1) {
        const h = e.read();
        h >= 2 ? a.push((h - 127) * t.record.doppler_velocity_resolution) : a.push(null);
      }
      t.record.velocity = a;
    } catch (a) {
      r.logger.warn(a.message);
    }
  }
  return t.record.spectral_width_pointer > 0 && e.skip(t.record.spare4), t;
}, _e = (e, t) => (t.record = {
  rdaStatus: e.readShort(),
  operabilityStatus: e.readShort(),
  controlStatus: e.readShort(),
  auxiliaryPowerGeneratorState: e.readShort(),
  averageTransmitterPower: e.readShort(),
  horizontalReflectivityCalibrationCorrection: e.readSignedInt() / 100,
  dataTransmissionEnabled: e.readShort(),
  volumeCoveragePatternNumber: e.readSignedInt(),
  rdaControlAuthorization: e.readShort(),
  rdaBuildNumber: xe(e.readSignedInt()),
  operationalMode: e.readShort(),
  superResolutionStatus: e.readShort(),
  clutterMitigationDecisionStatus: e.readShort(),
  avsetStatus: e.readShort(),
  rdaAlarmSummary: e.readShort(),
  commandAcknowledgement: e.readShort(),
  channelControlStatus: e.readShort(),
  spotBlankingStatus: e.readShort(),
  bypassMapGenerationDate: e.readInt(),
  bypassMapGenerationTime: e.readInt(),
  clutterFilterMapGenerationDate: e.readInt(),
  clutterFilterMapGenerationTime: e.readInt(),
  verticalReflectivyCalibrationCorrection: e.readSignedInt() / 100,
  transmitterPowerSourceStatus: e.readShort(),
  rmsControlStatus: e.readShort(),
  performanceCheckStatus: e.readShort(),
  alarmCodes: ge(e),
  signalProcessingOptions: e.readShort(),
  spares: e.read(36),
  statusVersion: e.readInt()
}, t), xe = (e) => e / 100 > 2 ? e / 100 : e / 10, ge = (e) => {
  const t = [];
  for (let r = 0; r < 14; r += 1)
    t.push(e.readShort());
  return t;
}, Se = (e, t, r, i) => {
  const a = {
    id: e.readString(4),
    mseconds: e.readInt(),
    julian_date: e.readShort(),
    radial_number: e.readShort(),
    azimuth: e.readFloat(),
    compress_idx: e.readByte(),
    sp: e.readByte(),
    radial_length: e.readShort(),
    ars: e.readByte(),
    rs: e.readByte(),
    elevation_number: e.readByte(),
    cut: e.readByte(),
    elevation_angle: e.readFloat(),
    rsbs: e.readByte(),
    aim: e.readByte(),
    dcount: e.readShort()
  };
  try {
    if (!a.id.match(/[A-Z]{4}/)) throw new Error(`Invalid record id: ${a.id}`);
    if (a.mseconds > 86401e3) throw new Error(`Invalid timestamp (ms): ${a.mseconds}`);
  } catch (y) {
    return i.logger.warn(y.message), t;
  }
  t.record = a;
  const s = [];
  for (let y = 0; y < 9; y += 1) {
    const C = e.readInt();
    y < t.record.dcount && s.push(C);
  }
  const h = {
    VOL: "volume",
    ELE: "elevation",
    RAD: "radial",
    REF: "reflect",
    VEL: "velocity",
    "SW ": "spectrum",
    // intentional space to fill 3-character requirement
    ZDR: "zdr",
    PHI: "phi",
    RHO: "rho"
  }, l = t.message_size * 2;
  let n = !1, _ = 0;
  for (let y = 0; y < s.length; y += 1) {
    const C = s[y] + r + ve;
    e.seek(C);
    try {
      const { name: I } = Re(e);
      if (n && h[n.name] && (t.record[h[n.name]] = n), n = !1, s[y] < l) {
        let w = !1;
        switch (I) {
          case "VOL":
            w = me(e);
            break;
          case "ELV":
            w = ye(e);
            break;
          case "RAD":
            w = Ee(e);
            break;
          default:
            w = we(e);
        }
        n = w;
      } else
        throw new Error(`Block overruns file at ${e.getPos()}`);
      _ = C;
    } catch (I) {
      i.logger.warn(I.message), n = !1, t.endedEarly = _;
      break;
    }
  }
  return n && h[n.name] && (t.record[h[n.name]] = n), t;
}, me = (e) => ({
  block_type: e.readString(1),
  name: e.readString(3),
  size: e.readShort(),
  version_major: e.read(),
  version_minor: e.read(),
  latitude: e.readFloat(),
  longitude: e.readFloat(),
  elevation: e.readShort(),
  feedhorn_height: e.readShort(),
  calibration: e.readFloat(),
  tx_horizontal: e.readFloat(),
  tx_vertical: e.readFloat(),
  differential_reflectivity: e.readFloat(),
  differential_phase: e.readFloat(),
  volume_coverage_pattern: e.readShort(),
  processing_status: e.readShort(),
  zdr_bias_estimate: e.readShort()
}), ye = (e) => ({
  block_type: e.readString(1),
  name: e.readString(3),
  size: e.readShort(),
  atmos: e.readShort(),
  calibration: e.readFloat()
}), Ee = (e) => ({
  block_type: e.readString(1),
  name: e.readString(3),
  size: e.readShort(),
  unambiguous_range: e.readShort() / 10,
  horizontal_noise_level: e.readFloat(),
  vertical_noise_level: e.readFloat(),
  nyquist_velocity: e.readShort(),
  radial_flags: e.readShort(),
  horizontal_calibration: e.readFloat(),
  vertical_calibration: e.readFloat()
}), we = (e) => {
  const t = {
    block_type: e.readString(1),
    name: e.readString(3),
    spare: e.read(4),
    gate_count: e.readShort(),
    first_gate: e.readShort() / 1e3,
    // scale int to float 0.001 precision
    gate_size: e.readShort() / 1e3,
    // scale int to float 0.001 precision
    rf_threshold: e.readShort() / 10,
    // scale int to float 0.1 precision
    snr_threshold: e.readShort() / 1e3,
    // scale int to float 0.001 precision
    control_flags: e.read(),
    data_size: e.read(),
    scale: e.readFloat(),
    offset: e.readFloat(),
    moment_data: []
  };
  let r = e.read.bind(e), i = 1;
  t.data_size === 16 && (r = e.readShort.bind(e), i = 2);
  const a = t.gate_count * i;
  for (let s = 0; s < a; s += i) {
    const h = r();
    h >= 2 ? t.moment_data.push((h - t.offset) / t.scale) : t.moment_data.push(null);
  }
  return t;
}, Re = (e) => {
  const t = e.readString(1), r = e.readString(3);
  if (e.skip(-4), !(t === "D" || t === "R"))
    throw new Error(`Invalid data block type: 0x${(t.charCodeAt(0) || 0).toString(16).padStart(2, "0")} at ${e.getPos()}`);
  return { name: r, type: t };
}, Be = (e, t) => {
  t.record = {
    message_size: e.readShort(),
    pattern_type: e.readShort(),
    pattern_number: e.readShort(),
    num_elevations: e.readShort(),
    version: e.readByte(),
    clutter_number: e.readByte(),
    velocity_resolution: Ce(e.readByte()),
    pulse_width: ke(e.readByte()),
    reserved1: e.readInt(),
    vcp_sequencing: Ae(e.readShort()),
    vcp_supplemental: Ie(e.readShort()),
    reserved2: e.readShort()
  }, t.record.elevations = [];
  for (let r = 1; r <= t.record.num_elevations; r += 1) {
    const i = {
      elevation_angle: q(e.readShort()),
      channel_config: e.readByte(),
      waveform_type: e.readByte(),
      super_res_control: ze(e.readByte()),
      surv_prf_number: e.readByte(),
      surv_prf_pulse: e.readShort(),
      azimuth_rate: De(e.readShort()),
      ref_threshold: e.readShort(),
      vel_threshold: e.readShort(),
      sw_threshold: e.readShort(),
      diff_ref_threshold: e.readShort(),
      diff_ph_threshold: e.readShort(),
      cor_coeff_threshold: e.readShort(),
      edge_angle_s1: q(e.readShort()),
      prf_num_s1: e.readShort(),
      prf_pulse_s1: e.readShort(),
      supplemental_data: Te(e.readShort()),
      edge_angle_s2: q(e.readShort()),
      prf_num_s2: e.readShort(),
      prf_pulse_s2: e.readShort(),
      ebc_angle: q(e.readShort()),
      edge_angle_s3: q(e.readShort()),
      prf_num_s3: e.readShort(),
      prf_pulse_s3: e.readShort(),
      reserved: e.readShort()
    };
    t.record.elevations[r] = i;
  }
  return t;
}, x = (e, t, r) => {
  if (r !== void 0) {
    let i = 0;
    for (let a = t; a <= r; a += 1)
      e & 2 ** a && (i += 2 ** (a - t));
    return i;
  }
  return (e & 2 ** t) > 0;
}, q = (e) => {
  let t = 0;
  for (let r = 15; r >= 3; r -= 1)
    x(e, r) && (t += 180 / 2 ** (15 - r));
  return t;
}, Ce = (e) => e === 2 ? 0.5 : 1, ke = (e) => e === 2 ? "short" : "Long", Ae = (e) => ({
  elevations: x(e, 0, 4),
  max_sails_cuts: x(e, 5, 6),
  sequence_active: x(e, 13),
  truncated_vcp: x(e, 14)
}), Ie = (e) => ({
  sails_vcp: x(e, 0),
  number_sails_cuts: x(e, 1, 3),
  mrle_vcp: x(e, 4),
  number_mrle_cuts: x(e, 5, 7),
  mpda_vcp: x(e, 11),
  base_tilt_vcp: x(e, 12),
  number_base_tilts: x(e, 13, 15)
}), ze = (e) => ({
  super_res: {
    halfDegreeAzimuth: x(e, 0),
    quarterKm: x(e, 1),
    "300km": x(e, 2)
  },
  dual_pol: {
    "300km": x(e, 3)
  }
}), De = (e) => {
  let t = 0;
  for (let r = 14; r >= 3; r -= 1)
    x(e, r) && (t += 22.5 / 2 ** (14 - r));
  return x(e, 15) && (t = -t), t;
}, Te = (e) => ({
  sails_cut: x(e, 0),
  sails_sequence: x(e, 1, 3),
  mrle_cut: x(e, 4),
  mrle_sequence: x(e, 5, 7),
  mpda_cut: x(e, 9),
  base_tilt_cut: x(e, 10)
}), Oe = (e, t, r, i) => {
  if (r === void 0) return !1;
  e.seek(t);
  const a = ne(e, r, i);
  return a || (e.seek(t), ne(e, r + 1, i));
}, ne = (e, t, r) => {
  const i = e.buffer.length - 10;
  for (; e.getPos() < i; ) {
    let a = 2;
    if (e.readShort() === t) {
      if (e.skip(4), a += 8, e.readShort() === 1 && e.readShort() === 1) {
        const s = e.getPos() - a - 6;
        return r.logger.warn(`Found next block at ${s}`), s;
      }
      e.skip(-a);
    }
  }
  return !1;
}, Pe = (e, t, r, i, a) => {
  let s = 0;
  i != null && i.ICAO && (s = Z);
  const h = t * ue + s + r;
  if (h >= e.getLength()) return { finished: !0 };
  const l = Fe(e, h, a);
  if (!l.endedEarly) return l;
  const n = Oe(e, l.endedEarly, i == null ? void 0 : i.modified_julian_date, a);
  if (n === !1)
    throw new Error(`Unable to recover message at ${h}`);
  return l.actual_size = (n - h) / 2 - fe, l;
}, Fe = (e, t, r) => {
  e.seek(t), e.skip(fe);
  const i = {
    message_size: e.readShort(),
    channel: e.readByte(),
    message_type: e.readByte(),
    id_sequence: e.readShort(),
    message_julian_date: e.readShort(),
    message_mseconds: e.readInt(),
    segment_count: e.readShort(),
    segment_number: e.readShort()
  };
  switch (i.message_type) {
    case 31:
      return Se(e, i, t, r);
    case 1:
      return pe(e, i, r);
    case 2:
      return _e(e, i);
    case 5:
    case 7:
      return Be(e, i);
    default:
      return !1;
  }
};
function $e(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var K, se;
function Ne() {
  if (se) return K;
  se = 1;
  var e = [0, 1, 3, 7, 15, 31, 63, 127, 255], t = function(r) {
    this.stream = r, this.bitOffset = 0, this.curByte = 0, this.hasByte = !1;
  };
  return t.prototype._ensureByte = function() {
    this.hasByte || (this.curByte = this.stream.readByte(), this.hasByte = !0);
  }, t.prototype.read = function(r) {
    for (var i = 0; r > 0; ) {
      this._ensureByte();
      var a = 8 - this.bitOffset;
      if (r >= a)
        i <<= a, i |= e[a] & this.curByte, this.hasByte = !1, this.bitOffset = 0, r -= a;
      else {
        i <<= r;
        var s = a - r;
        i |= (this.curByte & e[r] << s) >> s, this.bitOffset += r, r = 0;
      }
    }
    return i;
  }, t.prototype.seek = function(r) {
    var i = r % 8, a = (r - i) / 8;
    this.bitOffset = i, this.stream.seek(a), this.hasByte = !1;
  }, t.prototype.pi = function() {
    var r = new Buffer(6), i;
    for (i = 0; i < r.length; i++)
      r[i] = this.read(8);
    return r.toString("hex");
  }, K = t, K;
}
var Y, de;
function He() {
  if (de) return Y;
  de = 1;
  var e = function() {
  };
  return e.prototype.readByte = function() {
    throw new Error("abstract method readByte() not implemented");
  }, e.prototype.read = function(t, r, i) {
    for (var a = 0; a < i; ) {
      var s = this.readByte();
      if (s < 0)
        return a === 0 ? -1 : a;
      t[r++] = s, a++;
    }
    return a;
  }, e.prototype.seek = function(t) {
    throw new Error("abstract method seek() not implemented");
  }, e.prototype.writeByte = function(t) {
    throw new Error("abstract method readByte() not implemented");
  }, e.prototype.write = function(t, r, i) {
    var a;
    for (a = 0; a < i; a++)
      this.writeByte(t[r++]);
    return i;
  }, e.prototype.flush = function() {
  }, Y = e, Y;
}
var W, ce;
function Le() {
  return ce || (ce = 1, W = function() {
    var e = new Uint32Array([
      0,
      79764919,
      159529838,
      222504665,
      319059676,
      398814059,
      445009330,
      507990021,
      638119352,
      583659535,
      797628118,
      726387553,
      890018660,
      835552979,
      1015980042,
      944750013,
      1276238704,
      1221641927,
      1167319070,
      1095957929,
      1595256236,
      1540665371,
      1452775106,
      1381403509,
      1780037320,
      1859660671,
      1671105958,
      1733955601,
      2031960084,
      2111593891,
      1889500026,
      1952343757,
      2552477408,
      2632100695,
      2443283854,
      2506133561,
      2334638140,
      2414271883,
      2191915858,
      2254759653,
      3190512472,
      3135915759,
      3081330742,
      3009969537,
      2905550212,
      2850959411,
      2762807018,
      2691435357,
      3560074640,
      3505614887,
      3719321342,
      3648080713,
      3342211916,
      3287746299,
      3467911202,
      3396681109,
      4063920168,
      4143685023,
      4223187782,
      4286162673,
      3779000052,
      3858754371,
      3904687514,
      3967668269,
      881225847,
      809987520,
      1023691545,
      969234094,
      662832811,
      591600412,
      771767749,
      717299826,
      311336399,
      374308984,
      453813921,
      533576470,
      25881363,
      88864420,
      134795389,
      214552010,
      2023205639,
      2086057648,
      1897238633,
      1976864222,
      1804852699,
      1867694188,
      1645340341,
      1724971778,
      1587496639,
      1516133128,
      1461550545,
      1406951526,
      1302016099,
      1230646740,
      1142491917,
      1087903418,
      2896545431,
      2825181984,
      2770861561,
      2716262478,
      3215044683,
      3143675388,
      3055782693,
      3001194130,
      2326604591,
      2389456536,
      2200899649,
      2280525302,
      2578013683,
      2640855108,
      2418763421,
      2498394922,
      3769900519,
      3832873040,
      3912640137,
      3992402750,
      4088425275,
      4151408268,
      4197601365,
      4277358050,
      3334271071,
      3263032808,
      3476998961,
      3422541446,
      3585640067,
      3514407732,
      3694837229,
      3640369242,
      1762451694,
      1842216281,
      1619975040,
      1682949687,
      2047383090,
      2127137669,
      1938468188,
      2001449195,
      1325665622,
      1271206113,
      1183200824,
      1111960463,
      1543535498,
      1489069629,
      1434599652,
      1363369299,
      622672798,
      568075817,
      748617968,
      677256519,
      907627842,
      853037301,
      1067152940,
      995781531,
      51762726,
      131386257,
      177728840,
      240578815,
      269590778,
      349224269,
      429104020,
      491947555,
      4046411278,
      4126034873,
      4172115296,
      4234965207,
      3794477266,
      3874110821,
      3953728444,
      4016571915,
      3609705398,
      3555108353,
      3735388376,
      3664026991,
      3290680682,
      3236090077,
      3449943556,
      3378572211,
      3174993278,
      3120533705,
      3032266256,
      2961025959,
      2923101090,
      2868635157,
      2813903052,
      2742672763,
      2604032198,
      2683796849,
      2461293480,
      2524268063,
      2284983834,
      2364738477,
      2175806836,
      2238787779,
      1569362073,
      1498123566,
      1409854455,
      1355396672,
      1317987909,
      1246755826,
      1192025387,
      1137557660,
      2072149281,
      2135122070,
      1912620623,
      1992383480,
      1753615357,
      1816598090,
      1627664531,
      1707420964,
      295390185,
      358241886,
      404320391,
      483945776,
      43990325,
      106832002,
      186451547,
      266083308,
      932423249,
      861060070,
      1041341759,
      986742920,
      613929101,
      542559546,
      756411363,
      701822548,
      3316196985,
      3244833742,
      3425377559,
      3370778784,
      3601682597,
      3530312978,
      3744426955,
      3689838204,
      3819031489,
      3881883254,
      3928223919,
      4007849240,
      4037393693,
      4100235434,
      4180117107,
      4259748804,
      2310601993,
      2373574846,
      2151335527,
      2231098320,
      2596047829,
      2659030626,
      2470359227,
      2550115596,
      2947551409,
      2876312838,
      2788305887,
      2733848168,
      3165939309,
      3094707162,
      3040238851,
      2985771188
    ]), t = function() {
      var r = 4294967295;
      this.getCRC = function() {
        return ~r >>> 0;
      }, this.updateCRC = function(i) {
        r = r << 8 ^ e[(r >>> 24 ^ i) & 255];
      }, this.updateCRCRun = function(i, a) {
        for (; a-- > 0; )
          r = r << 8 ^ e[(r >>> 24 ^ i) & 255];
      };
    };
    return t;
  }()), W;
}
const Ue = "2.0.0", Me = "MIT", Ge = {
  version: Ue,
  license: Me
};
var Q, he;
function qe() {
  if (he) return Q;
  he = 1;
  var e = Ne(), t = He(), r = Le(), i = Ge, a = 20, s = 258, h = 0, l = 1, n = 2, _ = 6, y = 50, C = "314159265359", I = "177245385090", w = function(o, c) {
    var u = o[c], d;
    for (d = c; d > 0; d--)
      o[d] = o[d - 1];
    return o[0] = u, u;
  }, b = {
    OK: 0,
    LAST_BLOCK: -1,
    NOT_BZIP_DATA: -2,
    UNEXPECTED_INPUT_EOF: -3,
    UNEXPECTED_OUTPUT_EOF: -4,
    DATA_ERROR: -5,
    OUT_OF_MEMORY: -6,
    OBSOLETE_INPUT: -7,
    END_OF_BLOCK: -8
  }, R = {};
  R[b.LAST_BLOCK] = "Bad file checksum", R[b.NOT_BZIP_DATA] = "Not bzip data", R[b.UNEXPECTED_INPUT_EOF] = "Unexpected input EOF", R[b.UNEXPECTED_OUTPUT_EOF] = "Unexpected output EOF", R[b.DATA_ERROR] = "Data error", R[b.OUT_OF_MEMORY] = "Out of memory", R[b.OBSOLETE_INPUT] = "Obsolete (pre 0.9.5) bzip format not supported.";
  var g = function(o, c) {
    var u = R[o] || "unknown error";
    c && (u += ": " + c);
    var d = new TypeError(u);
    throw d.errorCode = o, d;
  }, m = function(o, c) {
    this.writePos = this.writeCurrent = this.writeCount = 0, this._start_bunzip(o, c);
  };
  m.prototype._init_block = function() {
    var o = this._get_next_block();
    return o ? (this.blockCRC = new r(), !0) : (this.writeCount = -1, !1);
  }, m.prototype._start_bunzip = function(o, c) {
    var u = new Buffer(4);
    (o.read(u, 0, 4) !== 4 || String.fromCharCode(u[0], u[1], u[2]) !== "BZh") && g(b.NOT_BZIP_DATA, "bad magic");
    var d = u[3] - 48;
    (d < 1 || d > 9) && g(b.NOT_BZIP_DATA, "level out of range"), this.reader = new e(o), this.dbufSize = 1e5 * d, this.nextoutput = 0, this.outputStream = c, this.streamCRC = 0;
  }, m.prototype._get_next_block = function() {
    var o, c, u, d = this.reader, p = d.pi();
    if (p === I)
      return !1;
    p !== C && g(b.NOT_BZIP_DATA), this.targetBlockCRC = d.read(32) >>> 0, this.streamCRC = (this.targetBlockCRC ^ (this.streamCRC << 1 | this.streamCRC >>> 31)) >>> 0, d.read(1) && g(b.OBSOLETE_INPUT);
    var v = d.read(24);
    v > this.dbufSize && g(b.DATA_ERROR, "initial position out of bounds");
    var f = d.read(16), E = new Buffer(256), k = 0;
    for (o = 0; o < 16; o++)
      if (f & 1 << 15 - o) {
        var V = o * 16;
        for (u = d.read(16), c = 0; c < 16; c++)
          u & 1 << 15 - c && (E[k++] = V + c);
      }
    var H = d.read(3);
    (H < n || H > _) && g(b.DATA_ERROR);
    var j = d.read(15);
    j === 0 && g(b.DATA_ERROR);
    var L = new Buffer(256);
    for (o = 0; o < H; o++)
      L[o] = o;
    var te = new Buffer(j);
    for (o = 0; o < j; o++) {
      for (c = 0; d.read(1); c++)
        c >= H && g(b.DATA_ERROR);
      te[o] = w(L, c);
    }
    var z = k + 2, re = [], S;
    for (c = 0; c < H; c++) {
      var D = new Buffer(z), U = new Uint16Array(a + 1);
      for (f = d.read(5), o = 0; o < z; o++) {
        for (; (f < 1 || f > a) && g(b.DATA_ERROR), !!d.read(1); )
          d.read(1) ? f-- : f++;
        D[o] = f;
      }
      var P, A;
      for (P = A = D[0], o = 1; o < z; o++)
        D[o] > A ? A = D[o] : D[o] < P && (P = D[o]);
      S = {}, re.push(S), S.permute = new Uint16Array(s), S.limit = new Uint32Array(a + 2), S.base = new Uint32Array(a + 1), S.minLen = P, S.maxLen = A;
      var F = 0;
      for (o = P; o <= A; o++)
        for (U[o] = S.limit[o] = 0, f = 0; f < z; f++)
          D[f] === o && (S.permute[F++] = f);
      for (o = 0; o < z; o++)
        U[D[o]]++;
      for (F = f = 0, o = P; o < A; o++)
        F += U[o], S.limit[o] = F - 1, F <<= 1, f += U[o], S.base[o + 1] = F - f;
      S.limit[A + 1] = Number.MAX_VALUE, S.limit[A] = F + U[A] - 1, S.base[P] = 0;
    }
    var N = new Uint32Array(256);
    for (o = 0; o < 256; o++)
      L[o] = o;
    var $ = 0, T = 0, ie = 0, B, M = this.dbuf = new Uint32Array(this.dbufSize);
    for (z = 0; ; ) {
      for (z-- || (z = y - 1, ie >= j && g(b.DATA_ERROR), S = re[te[ie++]]), o = S.minLen, c = d.read(o); o > S.maxLen && g(b.DATA_ERROR), !(c <= S.limit[o]); o++)
        c = c << 1 | d.read(1);
      c -= S.base[o], (c < 0 || c >= s) && g(b.DATA_ERROR);
      var G = S.permute[c];
      if (G === h || G === l) {
        $ || ($ = 1, f = 0), G === h ? f += $ : f += 2 * $, $ <<= 1;
        continue;
      }
      if ($)
        for ($ = 0, T + f > this.dbufSize && g(b.DATA_ERROR), B = E[L[0]], N[B] += f; f--; )
          M[T++] = B;
      if (G > k)
        break;
      T >= this.dbufSize && g(b.DATA_ERROR), o = G - 1, B = w(L, o), B = E[B], N[B]++, M[T++] = B;
    }
    for ((v < 0 || v >= T) && g(b.DATA_ERROR), c = 0, o = 0; o < 256; o++)
      u = c + N[o], N[o] = c, c = u;
    for (o = 0; o < T; o++)
      B = M[o] & 255, M[N[B]] |= o << 8, N[B]++;
    var X = 0, oe = 0, ae = 0;
    return T && (X = M[v], oe = X & 255, X >>= 8, ae = -1), this.writePos = X, this.writeCurrent = oe, this.writeCount = T, this.writeRun = ae, !0;
  }, m.prototype._read_bunzip = function(o, c) {
    var u, d, p;
    if (this.writeCount < 0)
      return 0;
    var v = this.dbuf, f = this.writePos, E = this.writeCurrent, k = this.writeCount;
    this.outputsize;
    for (var V = this.writeRun; k; ) {
      for (k--, d = E, f = v[f], E = f & 255, f >>= 8, V++ === 3 ? (u = E, p = d, E = -1) : (u = 1, p = E), this.blockCRC.updateCRCRun(p, u); u--; )
        this.outputStream.writeByte(p), this.nextoutput++;
      E != d && (V = 0);
    }
    return this.writeCount = k, this.blockCRC.getCRC() !== this.targetBlockCRC && g(b.DATA_ERROR, "Bad block CRC (got " + this.blockCRC.getCRC().toString(16) + " expected " + this.targetBlockCRC.toString(16) + ")"), this.nextoutput;
  };
  var O = function(o) {
    if ("readByte" in o)
      return o;
    var c = new t();
    return c.pos = 0, c.readByte = function() {
      return o[this.pos++];
    }, c.seek = function(u) {
      this.pos = u;
    }, c.eof = function() {
      return this.pos >= o.length;
    }, c;
  }, ee = function(o) {
    var c = new t(), u = !0;
    if (o)
      if (typeof o == "number")
        c.buffer = new Buffer(o), u = !1;
      else {
        if ("writeByte" in o)
          return o;
        c.buffer = o, u = !1;
      }
    else
      c.buffer = new Buffer(16384);
    return c.pos = 0, c.writeByte = function(d) {
      if (u && this.pos >= this.buffer.length) {
        var p = new Buffer(this.buffer.length * 2);
        this.buffer.copy(p), this.buffer = p;
      }
      this.buffer[this.pos++] = d;
    }, c.getBuffer = function() {
      if (this.pos !== this.buffer.length) {
        if (!u)
          throw new TypeError("outputsize does not match decoded input");
        var d = new Buffer(this.pos);
        this.buffer.copy(d, 0, 0, this.pos), this.buffer = d;
      }
      return this.buffer;
    }, c._coerced = !0, c;
  };
  return m.Err = b, m.decode = function(o, c, u) {
    for (var d = O(o), p = ee(c), v = new m(d, p); !("eof" in d && d.eof()); )
      if (v._init_block())
        v._read_bunzip();
      else {
        var f = v.reader.read(32) >>> 0;
        if (f !== v.streamCRC && g(b.DATA_ERROR, "Bad stream CRC (got " + v.streamCRC.toString(16) + " expected " + f.toString(16) + ")"), u && "eof" in d && !d.eof())
          v._start_bunzip(d, p);
        else break;
      }
    if ("getBuffer" in p)
      return p.getBuffer();
  }, m.decodeBlock = function(o, c, u) {
    var d = O(o), p = ee(u), v = new m(d, p);
    v.reader.seek(c);
    var f = v._get_next_block();
    if (f && (v.blockCRC = new r(), v.writeCopies = 0, v._read_bunzip()), "getBuffer" in p)
      return p.getBuffer();
  }, m.table = function(o, c, u) {
    var d = new t();
    d.delegate = O(o), d.pos = 0, d.readByte = function() {
      return this.pos++, this.delegate.readByte();
    }, d.delegate.eof && (d.eof = d.delegate.eof.bind(d.delegate));
    var p = new t();
    p.pos = 0, p.writeByte = function() {
      this.pos++;
    };
    for (var v = new m(d, p), f = v.dbufSize; !("eof" in d && d.eof()); ) {
      var E = d.pos * 8 + v.reader.bitOffset;
      if (v.reader.hasByte && (E -= 8), v._init_block()) {
        var k = p.pos;
        v._read_bunzip(), c(E, p.pos - k);
      } else if (v.reader.read(32), u && "eof" in d && !d.eof())
        v._start_bunzip(d, p), console.assert(
          v.dbufSize === f,
          "shouldn't change block size within multistream file"
        );
      else break;
    }
  }, m.Stream = t, m.version = i.version, m.license = i.license, Q = m, Q;
}
var Ze = qe();
const Ve = /* @__PURE__ */ $e(Ze), je = {}, Xe = (e) => {
  const t = je.gunzipSync(e.buffer);
  return new J(t, 0);
}, Ke = (e) => {
  const t = e.read(2);
  if (e.seek(0), t[0] === 31 && t[1] === 139) return Xe(e);
  if (e.getLength() <= Z) return e;
  let r = 0;
  if (le(e).header !== "BZh" && (e.seek(0), e.skip(Z), r = Z, le(e).header !== "BZh"))
    return e.seek(0), e;
  const a = [];
  for (e.seek(e.getPos() - 8); e.getPos() < e.getLength(); ) {
    const l = Math.abs(e.readInt());
    a.push({
      pos: e.getPos(),
      size: l
    }), e.seek(e.getPos() + l);
  }
  const s = [e.buffer.slice(0, r)];
  a.forEach((l) => {
    const n = e.buffer.slice(l.pos, l.pos + l.size), _ = Ve.decodeBlock(n, 32);
    s.push(_);
  });
  const h = Buffer.concat(s);
  return new J(h, 0);
}, le = (e) => ({
  size: e.readInt(),
  header: e.readString(3),
  block_size: e.readString(1)
}), Ye = (e) => {
  const t = e.readString(6);
  if (t === "AR2V00" || t === "ARCHIV") {
    const r = {};
    return r.version = e.readString(2), e.skip(4), r.modified_julian_date = e.readInt(), r.milliseconds = e.readInt(), r.ICAO = e.readString(4), e.seek(0), r.raw = e.read(Z), r;
  }
  return e.seek(0), {};
}, We = (e, t) => {
  var I, w, b, R, g, m;
  const r = new J(e, 0), i = [], a = Ke(r), s = Ye(a);
  let h = 0, l = 0, n, _ = {}, y = !1, C = !1;
  if (a.getPos() < a.getLength())
    do {
      try {
        n = Pe(a, l, h, s, t), l += 1;
      } catch (O) {
        t.logger.warn(O), C = !0, n = { finished: !0 };
      }
      if (!n.finished) {
        if (n.message_type === 31) {
          const O = n.actual_size ?? n.message_size;
          y = !0, h += O * 2 + 12 - ue;
        }
        [1, 5, 7, 31].includes(n.message_type) && (((I = n == null ? void 0 : n.record) != null && I.reflect || (w = n == null ? void 0 : n.record) != null && w.velocity || (b = n == null ? void 0 : n.record) != null && b.spectrum || (R = n == null ? void 0 : n.record) != null && R.zdr || (g = n == null ? void 0 : n.record) != null && g.phi || (m = n == null ? void 0 : n.record) != null && m.rho) && i.push(n), [5, 7].includes(n.message_type) && (_ = n));
      }
    } while (!n.finished);
  return {
    data: Qe(i),
    header: s,
    vcp: _,
    isTruncated: C,
    hasGaps: y
  };
}, Qe = (e) => {
  const t = [];
  return e.forEach((r) => {
    const { elevation_number: i } = r.record;
    t[i] ? t[i].push(r) : t[i] = [r];
  }), t;
}, Je = (...e) => {
  const t = e.flat(50), r = {
    options: {},
    vcp: {},
    header: {},
    data: []
  };
  return t.forEach((i) => {
    r.elevation = i.elevation ?? r.elevation, r.hasGaps = r.hasGaps || i.hasGaps, r.isTruncated = r.isTruncated || i.isTruncated, i.options && (r.options = { ...r.options, ...i.options }), i.vcp && (r.vcp = { ...r.vcp, ...i.vcp }), i.header && (r.header = { ...r.header, ...i.header }), i.data && i.listElevations().forEach((a) => {
      r.data[a] === void 0 && (r.data[a] = []), r.data[a].push(...i.data[a]);
    });
  }), r;
};
class be {
  /**
   * Parses a Nexrad Level 2 Data archive or chunk. Provide `rawData` as a `Buffer`. Returns an object formatted per the [ICD FOR RDA/RPG - Build RDA 20.0/RPG 20.0 (PDF)](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf), or as close as can reasonably be represented in a javascript object. Additional data accessors are provided in the returned object to pull out typical data in a format ready for processing.
   * Radar data is accessed through the get* methods
   *
   * @param {Buffer|Level2Radar} file Buffer with Nexrad Level 2 data. Alternatively a Level2Radar object, typically used internally when combining data.
   * @param {ParserOptions} [options] Parser options
   */
  constructor(t, r) {
    if (this.elevation = 1, t instanceof Buffer) {
      this.options = et(r);
      const {
        data: i,
        header: a,
        vcp: s,
        hasGaps: h,
        isTruncated: l
      } = We(t, this.options);
      this.data = i, this.header = a, this.vcp = s, this.hasGaps = h, this.isTruncated = l;
    } else if (typeof t == "object" && t.data && t.header && t.vcp)
      this.data = t.data, this.elevation = t.elevation, this.header = t.header, this.options = t.options, this.vcp = t.vcp, this.hasGaps = t.hasGaps, this.isTruncated = t.isTruncated;
    else
      throw new Error("Unknown data provided");
  }
  /**
   * Sets the elevation in use for get* methods
   *
   * @param {number} elevation Selected elevation number
   * @category Configuration
   */
  setElevation(t) {
    this.elevation = t;
  }
  /**
   * Returns an single azimuth value or array of azimuth values for the current elevation and scan (or all scans if not provided).
   * The order of azimuths in the returned array matches the order of the data in other get* functions.
   *
   * @param {number} [scan] Selected scan
   * @category Data
   * @returns {number|number[]} Azimuth angle
   */
  getAzimuth(t) {
    var r, i, a, s, h, l, n, _;
    if (((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (this._checkData(), ((i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) === void 0) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);
      if (((s = (a = this == null ? void 0 : this.data) == null ? void 0 : a[this.elevation]) == null ? void 0 : s[t]) === void 0) throw new Error(`getAzimuth invalid scan selected: ${t}`);
      if (((_ = (n = (l = (h = this == null ? void 0 : this.data) == null ? void 0 : h[this.elevation]) == null ? void 0 : l[t]) == null ? void 0 : n.record) == null ? void 0 : _.azimuth) === void 0) throw new Error(`getAzimuth no data for elevation: ${this.elevation}, scan: ${t}`);
      return this.data[this.elevation][t].record.azimuth;
    }
    return this.data[this.elevation].map((y) => y.record.azimuth);
  }
  /**
   * Return the number of scans in the current elevation
   *
   * @category Metadata
   * @returns {number}
   */
  getScans() {
    var t;
    if (this._checkData(), ((t = this == null ? void 0 : this.data) == null ? void 0 : t[this.elevation]) === void 0) throw new Error(`getScans no data for elevation: ${this.elevation}`);
    return this.data[this.elevation].length;
  }
  /**
   * Return message_header information for all scans or a specific scan for the selected elevation
   *
   * @category Metadata
   * @param {number} [scan] Selected scan, omit to return all scans for this elevation
   * @returns {MessageHeader}
   */
  getHeader(t) {
    var r, i, a, s, h, l;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHeader invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[t]) === void 0) throw new Error(`getHeader invalid scan selected: ${t}`);
      if (((l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[t]) == null ? void 0 : l.record) === void 0) throw new Error(`getHeader no data for elevation: ${this.elevation}, scan: ${t}`);
      return this.data[this.elevation][t].record;
    }
    return this.data[this.elevation].map((n) => n.record);
  }
  /**
   * Returns an Object of radar reflectivity data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res reflectivity data, or an array of the data.
   */
  getHighresReflectivity(t) {
    var r, i, a, s, h, l, n;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHighresReflectivity invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[t]) === void 0) throw new Error(`getHighresReflectivity invalid scan selected: ${t}`);
      if (((n = (l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[t]) == null ? void 0 : l.record) == null ? void 0 : n.reflect) === void 0) throw new Error(`getHighresReflectivity no data for elevation: ${this.elevation}, scan: ${t}`);
      return this.data[this.elevation][t].record.reflect;
    }
    return this.data[this.elevation].map((_) => _.record.reflect);
  }
  /**
   * Returns an Object of radar velocity data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan, or null for all scans in this elevation
   * @returns {HighResData|HighResData[]} Scan's high res velocity data, or an array of the data.
   */
  getHighresVelocity(t) {
    var r, i, a, s, h, l, n;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHighresVelocity invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[t]) === void 0) throw new Error(`getHighresVelocity invalid scan selected: ${t}`);
      if (((n = (l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[t]) == null ? void 0 : l.record) == null ? void 0 : n.reflect) === void 0) throw new Error(`getHighresVelocity no data for elevation: ${this.elevation}, scan: ${t}`);
      return this.data[this.elevation][t].record.velocity;
    }
    return this.data[this.elevation].map((_) => _.record.velocity);
  }
  /**
   * Returns an Object of radar spectrum data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan, or null for all scans in this elevation
   * @returns {HighResData|HighResData[]} Scan's high res spectrum data, or an array of the data.
   */
  getHighresSpectrum(t) {
    var r, i, a, s, h, l, n;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHighresSpectrum invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[t]) === void 0) throw new Error(`getHighresSpectrum invalid scan selected: ${t}`);
      if (((n = (l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[t]) == null ? void 0 : l.record) == null ? void 0 : n.spectrum) === void 0) throw new Error(`getHighresSpectrum no data for elevation: ${this.elevation}, scan: ${t}`);
      return this.data[this.elevation][t].record.spectrum;
    }
    return this.data[this.elevation].map((_) => _.record.spectrum);
  }
  /**
   * Returns an Object of radar differential reflectivity data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res differential reflectivity data, or an array of the data.
   */
  getHighresDiffReflectivity(t) {
    var r, i, a, s, h, l, n;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHighresDiffReflectivity invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[this.scan]) === void 0) throw new Error(`getHighresDiffReflectivity invalid scan selected: ${this.scan}`);
      if (((n = (l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[this.scan]) == null ? void 0 : l.record) == null ? void 0 : n.zdr) === void 0) throw new Error(`getHighresDiffReflectivity no data for elevation: ${this.elevation}, scan: ${this.scan}`);
      return this.data[this.elevation][this.scan].record.zdr;
    }
    return this.data[this.elevation].map((_) => _.record.zdr);
  }
  /**
   * Returns an Object of radar differential phase data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res differential phase data, or an array of the data.
   */
  getHighresDiffPhase(t) {
    var r, i, a, s, h, l, n;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHighresDiffPhase invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[this.scan]) === void 0) throw new Error(`getHighresDiffPhase invalid scan selected: ${this.scan}`);
      if (((n = (l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[this.scan]) == null ? void 0 : l.record) == null ? void 0 : n.phi) === void 0) throw new Error(`getHighresDiffPhase no data for elevation: ${this.elevation}, scan: ${this.scan}`);
      return this.data[this.elevation][this.scan].record.phi;
    }
    return this.data[this.elevation].map((_) => _.record.phi);
  }
  /**
   * Returns an Object of radar correlation coefficient data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res correlation coefficient data, or an array of the data.
   */
  getHighresCorrelationCoefficient(t) {
    var r, i, a, s, h, l, n;
    if (this._checkData(), ((r = this == null ? void 0 : this.data) == null ? void 0 : r[this.elevation]) === void 0) throw new Error(`getHighresCorrelationCoefficient invalid elevation selected: ${this.elevation}`);
    if (t !== void 0) {
      if (((a = (i = this == null ? void 0 : this.data) == null ? void 0 : i[this.elevation]) == null ? void 0 : a[this.scan]) === void 0) throw new Error(`getHighresCorrelationCoefficient invalid scan selected: ${this.scan}`);
      if (((n = (l = (h = (s = this == null ? void 0 : this.data) == null ? void 0 : s[this.elevation]) == null ? void 0 : h[this.scan]) == null ? void 0 : l.record) == null ? void 0 : n.rho) === void 0) throw new Error(`getHighresCorrelationCoefficient no data for elevation: ${this.elevation}, scan: ${this.scan}`);
      return this.data[this.elevation][this.scan].record.rho;
    }
    return this.data[this.elevation].map((_) => _.record.rho);
  }
  /**
   * List all available elevations
   *
   * @category Metadata
   * @returns {number[]}
   */
  listElevations() {
    return Object.keys(this.data).map((t) => +t);
  }
  _checkData() {
    if (this.data.length === 0) throw new Error("No data found in file");
  }
  /**
   * Combines the data returned by multiple runs of the Level2Data constructor. This is typically used in "chunks" mode to combine all azimuths from one revolution into a single data set. data can be provided as an array of Level2Radar objects, individual Level2Data parameters or any combination thereof.
   *
   * The combine function blindly combines data and the right-most argument will overwrite any previously provided data. Individual azimuths located in Level2Radar.data[] will be appended. It is up to the calling routine to properly manage the parsing of related chunks and send it in to this routine.
   *
   * @param  {...Level2Radar} data Data to combine
   * @returns {Level2Radar} Combined data
   */
  static combineData(...t) {
    const r = Je(t);
    return new be(r);
  }
}
const et = (e) => {
  let t = (e == null ? void 0 : e.logger) ?? console;
  return t === !1 && (t = tt), {
    ...e,
    logger: t
  };
}, tt = {
  log: () => {
  },
  error: () => {
  },
  warn: () => {
  }
};
export {
  be as Level2Radar
};
