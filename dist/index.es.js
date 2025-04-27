class Se {
  /**
   * Store a buffer or string and add functionality for random access
   * Unless otherwise noted all read functions advance the file's pointer by the length of the data read
   *
   * @param {Uint8Array|string} file A file as a string or Uint8Array to load for random access
   * @param {number} endian Endianess of the file constants BIG_ENDIAN and LITTLE_ENDIAN are provided
   */
  constructor(o, u = 0) {
    if (this.offset = 0, this.buffer = null, u < 0) return;
    if (this.bigEndian = u === 0, typeof o == "string") {
      const x = new TextEncoder();
      this.buffer = x.encode(o);
    } else
      this.buffer = o;
    const d = new DataView(o.buffer);
    this.readFloatLocal = (x) => d.getFloat32(x, !1), this.readIntLocal = (x, p) => {
      if (p == 1)
        return d.getUint8(x);
      if (p == 2)
        return d.getUint16(x, !this.bigEndian);
      if (p == 4)
        return d.getUint32(x, !this.bigEndian);
      throw new Error("Unsupported byteLength", p);
    }, this.readSignedIntLocal = (x, p) => {
      if (p == 1)
        return d.getInt8(x);
      if (p == 2)
        return d.getInt16(x, !this.bigEndian);
      if (p == 4)
        return d.getInt32(x, !this.bigEndian);
      throw new Error("Unsupported byteLength", p);
    };
    const h = new TextDecoder();
    this.readStringLocal = (x, p) => h.decode(this.buffer.slice(x, x + p));
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
  seek(o) {
    this.offset = o;
  }
  /**
   * Read a string of a specificed length from the buffer
   *
   * @category Data
   * @param {number} length Length of string to read
   * @returns {string}
   */
  readString(o) {
    const u = this.readStringLocal(this.offset, o);
    return this.offset += o, u;
  }
  /**
   * Read a float from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readFloat() {
    const o = this.readFloatLocal(this.offset);
    return this.offset += 4, o;
  }
  /**
   * Read a 4-byte unsigned integer from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readInt() {
    const o = this.readIntLocal(this.offset, 4);
    return this.offset += 4, o;
  }
  /**
   * Read a 2-byte unsigned integer from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readShort() {
    const o = this.readIntLocal(this.offset, 2);
    return this.offset += 2, o;
  }
  /**
   * Read a 2-byte signed integer from the buffer
   *
   * @category Data
   * @returns {number}
   */
  readSignedInt() {
    const o = this.readSignedIntLocal(this.offset, 2);
    return this.offset += 2, o;
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
  read(o = 1) {
    let u = null;
    return o > 1 ? (u = this.buffer.slice(this.offset, this.offset + o), this.offset += o) : (u = this.buffer[this.offset], this.offset += 1), u;
  }
  /**
   * Advance the pointer forward a set number of bytes
   *
   * @category Positioning
   * @param {number} length Number of bytes to skip
   */
  skip(o) {
    this.offset += o;
  }
}
const le = 24, ze = 2432, Ne = 12, qe = 28, Ve = (r, o, u) => {
  const d = r.getPos();
  if (o.record = {
    mseconds: r.readInt(),
    julian_date: r.readShort(),
    unambiguous_range: r.readShort() / 10,
    azimuth: r.readShort() / 8 * 0.043945,
    azimuth_number: r.readShort(),
    radial_status: r.readShort(),
    elevation_angle: r.readShort() / 8 * 0.043945,
    elevation_number: r.readShort(),
    surveillance_range: r.readSignedInt() / 1e3,
    doppler_range: r.readSignedInt() / 1e3,
    surveillance_range_sample_interval: r.readSignedInt() / 1e3,
    doppler_range_sample_interval: r.readSignedInt() / 1e3,
    number_of_surveillance_bins: r.readShort(),
    number_of_doppler_bins: r.readShort(),
    cut_sector_number: r.readShort(),
    calibration_constant: r.readFloat(),
    surveillance_pointer: r.readShort(),
    velocity_pointer: r.readShort(),
    spectral_width_pointer: r.readShort(),
    doppler_velocity_resolution: r.readShort() * 0.25,
    vcp: r.readShort(),
    spare1: r.read(8),
    spare2: r.readShort(),
    spare3: r.readShort(),
    spare4: r.readShort(),
    nyquist_velocity: r.readShort() / 100,
    atoms: r.readShort() / 1e3,
    tover: r.readShort() / 10,
    radial_spot_blanking_status: r.readShort(),
    spare5: r.read(32)
  }, o.record.surveillance_pointer > 0) {
    r.seek(d + o.record.surveillance_pointer);
    try {
      if (r.getPos() > r.getLength()) throw new Error("Message Type 1: Invalid surveillance (reflectivity) offset");
      if (r.getPos() + o.record.number_of_surveillance_bins >= r.getLength()) throw new Error("Message Type 1: Invalid surveillance (reflectivity) length");
      const h = [];
      for (let x = 0; x < o.record.number_of_surveillance_bins; x += 1) {
        const p = r.read();
        p >= 2 ? h.push(p / 2 - 33) : h.push(null);
      }
      o.record.reflect = h;
    } catch (h) {
      u.logger.warn(h.message);
    }
  }
  if (o.record.velocity_pointer > 0) {
    r.seek(d + o.record.velocity_pointer);
    try {
      if (r.getPos() > r.getLength()) throw new Error("Message Type 1: Invalid doppler (velocity) offset");
      if (r.getPos() + o.record.number_of_doppler_bins >= r.getLength()) throw new Error("Message Type 1: Invalid doppler (velocity) length");
      const h = [];
      for (let x = 0; x < o.record.number_of_doppler_bins; x += 1) {
        const p = r.read();
        p >= 2 ? h.push((p - 127) * o.record.doppler_velocity_resolution) : h.push(null);
      }
      o.record.velocity = h;
    } catch (h) {
      u.logger.warn(h.message);
    }
  }
  return o.record.spectral_width_pointer > 0 && r.skip(o.record.spare4), o;
}, Ze = (r, o) => (o.record = {
  rdaStatus: r.readShort(),
  operabilityStatus: r.readShort(),
  controlStatus: r.readShort(),
  auxiliaryPowerGeneratorState: r.readShort(),
  averageTransmitterPower: r.readShort(),
  horizontalReflectivityCalibrationCorrection: r.readSignedInt() / 100,
  dataTransmissionEnabled: r.readShort(),
  volumeCoveragePatternNumber: r.readSignedInt(),
  rdaControlAuthorization: r.readShort(),
  rdaBuildNumber: je(r.readSignedInt()),
  operationalMode: r.readShort(),
  superResolutionStatus: r.readShort(),
  clutterMitigationDecisionStatus: r.readShort(),
  avsetStatus: r.readShort(),
  rdaAlarmSummary: r.readShort(),
  commandAcknowledgement: r.readShort(),
  channelControlStatus: r.readShort(),
  spotBlankingStatus: r.readShort(),
  bypassMapGenerationDate: r.readInt(),
  bypassMapGenerationTime: r.readInt(),
  clutterFilterMapGenerationDate: r.readInt(),
  clutterFilterMapGenerationTime: r.readInt(),
  verticalReflectivyCalibrationCorrection: r.readSignedInt() / 100,
  transmitterPowerSourceStatus: r.readShort(),
  rmsControlStatus: r.readShort(),
  performanceCheckStatus: r.readShort(),
  alarmCodes: Ye(r),
  signalProcessingOptions: r.readShort(),
  spares: r.read(36),
  statusVersion: r.readInt()
}, o), je = (r) => r / 100 > 2 ? r / 100 : r / 10, Ye = (r) => {
  const o = [];
  for (let u = 0; u < 14; u += 1)
    o.push(r.readShort());
  return o;
}, Xe = (r, o, u, d) => {
  const h = {
    id: r.readString(4),
    mseconds: r.readInt(),
    julian_date: r.readShort(),
    radial_number: r.readShort(),
    azimuth: r.readFloat(),
    compress_idx: r.readByte(),
    sp: r.readByte(),
    radial_length: r.readShort(),
    ars: r.readByte(),
    rs: r.readByte(),
    elevation_number: r.readByte(),
    cut: r.readByte(),
    elevation_angle: r.readFloat(),
    rsbs: r.readByte(),
    aim: r.readByte(),
    dcount: r.readShort()
  };
  try {
    if (!h.id.match(/[A-Z]{4}/)) throw new Error(`Invalid record id: ${h.id}`);
    if (h.mseconds > 86401e3) throw new Error(`Invalid timestamp (ms): ${h.mseconds}`);
  } catch (E) {
    return d.logger.warn(E.message), o;
  }
  o.record = h;
  const x = [];
  for (let E = 0; E < 9; E += 1) {
    const F = r.readInt();
    E < o.record.dcount && x.push(F);
  }
  const p = {
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
  }, s = o.message_size * 2;
  let y = !1, m = 0;
  for (let E = 0; E < x.length; E += 1) {
    const F = x[E] + u + qe;
    r.seek(F);
    try {
      const { name: $ } = et(r);
      if (y && p[y.name] && (o.record[p[y.name]] = y), y = !1, x[E] < s) {
        let _ = !1;
        switch ($) {
          case "VOL":
            _ = We(r);
            break;
          case "ELV":
            _ = Ke(r);
            break;
          case "RAD":
            _ = Je(r);
            break;
          default:
            _ = Qe(r);
        }
        y = _;
      } else
        throw new Error(`Block overruns file at ${r.getPos()}`);
      m = F;
    } catch ($) {
      d.logger.warn($.message), y = !1, o.endedEarly = m;
      break;
    }
  }
  return y && p[y.name] && (o.record[p[y.name]] = y), o;
}, We = (r) => ({
  block_type: r.readString(1),
  name: r.readString(3),
  size: r.readShort(),
  version_major: r.read(),
  version_minor: r.read(),
  latitude: r.readFloat(),
  longitude: r.readFloat(),
  elevation: r.readShort(),
  feedhorn_height: r.readShort(),
  calibration: r.readFloat(),
  tx_horizontal: r.readFloat(),
  tx_vertical: r.readFloat(),
  differential_reflectivity: r.readFloat(),
  differential_phase: r.readFloat(),
  volume_coverage_pattern: r.readShort(),
  processing_status: r.readShort(),
  zdr_bias_estimate: r.readShort()
}), Ke = (r) => ({
  block_type: r.readString(1),
  name: r.readString(3),
  size: r.readShort(),
  atmos: r.readShort(),
  calibration: r.readFloat()
}), Je = (r) => ({
  block_type: r.readString(1),
  name: r.readString(3),
  size: r.readShort(),
  unambiguous_range: r.readShort() / 10,
  horizontal_noise_level: r.readFloat(),
  vertical_noise_level: r.readFloat(),
  nyquist_velocity: r.readShort(),
  radial_flags: r.readShort(),
  horizontal_calibration: r.readFloat(),
  vertical_calibration: r.readFloat()
}), Qe = (r) => {
  const o = {
    block_type: r.readString(1),
    name: r.readString(3),
    spare: r.read(4),
    gate_count: r.readShort(),
    first_gate: r.readShort() / 1e3,
    // scale int to float 0.001 precision
    gate_size: r.readShort() / 1e3,
    // scale int to float 0.001 precision
    rf_threshold: r.readShort() / 10,
    // scale int to float 0.1 precision
    snr_threshold: r.readShort() / 1e3,
    // scale int to float 0.001 precision
    control_flags: r.read(),
    data_size: r.read(),
    scale: r.readFloat(),
    offset: r.readFloat(),
    moment_data: []
  };
  let u = r.read.bind(r), d = 1;
  o.data_size === 16 && (u = r.readShort.bind(r), d = 2);
  const h = o.gate_count * d;
  for (let x = 0; x < h; x += d) {
    const p = u();
    p >= 2 ? o.moment_data.push((p - o.offset) / o.scale) : o.moment_data.push(null);
  }
  return o;
}, et = (r) => {
  const o = r.readString(1), u = r.readString(3);
  if (r.skip(-4), !(o === "D" || o === "R"))
    throw new Error(`Invalid data block type: 0x${(o.charCodeAt(0) || 0).toString(16).padStart(2, "0")} at ${r.getPos()}`);
  return { name: u, type: o };
}, tt = (r, o) => {
  o.record = {
    message_size: r.readShort(),
    pattern_type: r.readShort(),
    pattern_number: r.readShort(),
    num_elevations: r.readShort(),
    version: r.readByte(),
    clutter_number: r.readByte(),
    velocity_resolution: rt(r.readByte()),
    pulse_width: it(r.readByte()),
    reserved1: r.readInt(),
    vcp_sequencing: nt(r.readShort()),
    vcp_supplemental: ot(r.readShort()),
    reserved2: r.readShort()
  }, o.record.elevations = [];
  for (let u = 1; u <= o.record.num_elevations; u += 1) {
    const d = {
      elevation_angle: de(r.readShort()),
      channel_config: r.readByte(),
      waveform_type: r.readByte(),
      super_res_control: at(r.readByte()),
      surv_prf_number: r.readByte(),
      surv_prf_pulse: r.readShort(),
      azimuth_rate: st(r.readShort()),
      ref_threshold: r.readShort(),
      vel_threshold: r.readShort(),
      sw_threshold: r.readShort(),
      diff_ref_threshold: r.readShort(),
      diff_ph_threshold: r.readShort(),
      cor_coeff_threshold: r.readShort(),
      edge_angle_s1: de(r.readShort()),
      prf_num_s1: r.readShort(),
      prf_pulse_s1: r.readShort(),
      supplemental_data: ut(r.readShort()),
      edge_angle_s2: de(r.readShort()),
      prf_num_s2: r.readShort(),
      prf_pulse_s2: r.readShort(),
      ebc_angle: de(r.readShort()),
      edge_angle_s3: de(r.readShort()),
      prf_num_s3: r.readShort(),
      prf_pulse_s3: r.readShort(),
      reserved: r.readShort()
    };
    o.record.elevations[u] = d;
  }
  return o;
}, P = (r, o, u) => {
  if (u !== void 0) {
    let d = 0;
    for (let h = o; h <= u; h += 1)
      r & 2 ** h && (d += 2 ** (h - o));
    return d;
  }
  return (r & 2 ** o) > 0;
}, de = (r) => {
  let o = 0;
  for (let u = 15; u >= 3; u -= 1)
    P(r, u) && (o += 180 / 2 ** (15 - u));
  return o;
}, rt = (r) => r === 2 ? 0.5 : 1, it = (r) => r === 2 ? "short" : "Long", nt = (r) => ({
  elevations: P(r, 0, 4),
  max_sails_cuts: P(r, 5, 6),
  sequence_active: P(r, 13),
  truncated_vcp: P(r, 14)
}), ot = (r) => ({
  sails_vcp: P(r, 0),
  number_sails_cuts: P(r, 1, 3),
  mrle_vcp: P(r, 4),
  number_mrle_cuts: P(r, 5, 7),
  mpda_vcp: P(r, 11),
  base_tilt_vcp: P(r, 12),
  number_base_tilts: P(r, 13, 15)
}), at = (r) => ({
  super_res: {
    halfDegreeAzimuth: P(r, 0),
    quarterKm: P(r, 1),
    "300km": P(r, 2)
  },
  dual_pol: {
    "300km": P(r, 3)
  }
}), st = (r) => {
  let o = 0;
  for (let u = 14; u >= 3; u -= 1)
    P(r, u) && (o += 22.5 / 2 ** (14 - u));
  return P(r, 15) && (o = -o), o;
}, ut = (r) => ({
  sails_cut: P(r, 0),
  sails_sequence: P(r, 1, 3),
  mrle_cut: P(r, 4),
  mrle_sequence: P(r, 5, 7),
  mpda_cut: P(r, 9),
  base_tilt_cut: P(r, 10)
}), ct = (r, o, u, d) => {
  if (u === void 0) return !1;
  r.seek(o);
  const h = Ae(r, u, d);
  return h || (r.seek(o), Ae(r, u + 1, d));
}, Ae = (r, o, u) => {
  const d = r.buffer.length - 10;
  for (; r.getPos() < d; ) {
    let h = 2;
    if (r.readShort() === o) {
      if (r.skip(4), h += 8, r.readShort() === 1 && r.readShort() === 1) {
        const x = r.getPos() - h - 6;
        return u.logger.warn(`Found next block at ${x}`), x;
      }
      r.skip(-h);
    }
  }
  return !1;
}, dt = (r, o, u, d, h) => {
  let x = 0;
  d != null && d.ICAO && (x = le);
  const p = o * ze + x + u;
  if (p >= r.getLength()) return { finished: !0 };
  const s = ht(r, p, h);
  if (!s.endedEarly) return s;
  const y = ct(r, s.endedEarly, d == null ? void 0 : d.modified_julian_date, h);
  if (y === !1)
    throw new Error(`Unable to recover message at ${p}`);
  return s.actual_size = (y - p) / 2 - Ne, s;
}, ht = (r, o, u) => {
  r.seek(o), r.skip(Ne);
  const d = {
    message_size: r.readShort(),
    channel: r.readByte(),
    message_type: r.readByte(),
    id_sequence: r.readShort(),
    message_julian_date: r.readShort(),
    message_mseconds: r.readInt(),
    segment_count: r.readShort(),
    segment_number: r.readShort()
  };
  switch (d.message_type) {
    case 31:
      return Xe(r, d, o, u);
    case 1:
      return Ve(r, d, u);
    case 2:
      return Ze(r, d);
    case 5:
    case 7:
      return tt(r, d);
    default:
      return !1;
  }
};
function lt(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var _e, Re;
function ft() {
  if (Re) return _e;
  Re = 1;
  var r = [0, 1, 3, 7, 15, 31, 63, 127, 255], o = function(u) {
    this.stream = u, this.bitOffset = 0, this.curByte = 0, this.hasByte = !1;
  };
  return o.prototype._ensureByte = function() {
    this.hasByte || (this.curByte = this.stream.readByte(), this.hasByte = !0);
  }, o.prototype.read = function(u) {
    for (var d = 0; u > 0; ) {
      this._ensureByte();
      var h = 8 - this.bitOffset;
      if (u >= h)
        d <<= h, d |= r[h] & this.curByte, this.hasByte = !1, this.bitOffset = 0, u -= h;
      else {
        d <<= u;
        var x = h - u;
        d |= (this.curByte & r[u] << x) >> x, this.bitOffset += u, u = 0;
      }
    }
    return d;
  }, o.prototype.seek = function(u) {
    var d = u % 8, h = (u - d) / 8;
    this.bitOffset = d, this.stream.seek(h), this.hasByte = !1;
  }, o.prototype.pi = function() {
    var u = new Buffer(6), d;
    for (d = 0; d < u.length; d++)
      u[d] = this.read(8);
    return u.toString("hex");
  }, _e = o, _e;
}
var me, Fe;
function pt() {
  if (Fe) return me;
  Fe = 1;
  var r = function() {
  };
  return r.prototype.readByte = function() {
    throw new Error("abstract method readByte() not implemented");
  }, r.prototype.read = function(o, u, d) {
    for (var h = 0; h < d; ) {
      var x = this.readByte();
      if (x < 0)
        return h === 0 ? -1 : h;
      o[u++] = x, h++;
    }
    return h;
  }, r.prototype.seek = function(o) {
    throw new Error("abstract method seek() not implemented");
  }, r.prototype.writeByte = function(o) {
    throw new Error("abstract method readByte() not implemented");
  }, r.prototype.write = function(o, u, d) {
    var h;
    for (h = 0; h < d; h++)
      this.writeByte(o[u++]);
    return d;
  }, r.prototype.flush = function() {
  }, me = r, me;
}
var Ee, Ce;
function xt() {
  return Ce || (Ce = 1, Ee = function() {
    var r = new Uint32Array([
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
    ]), o = function() {
      var u = 4294967295;
      this.getCRC = function() {
        return ~u >>> 0;
      }, this.updateCRC = function(d) {
        u = u << 8 ^ r[(u >>> 24 ^ d) & 255];
      }, this.updateCRCRun = function(d, h) {
        for (; h-- > 0; )
          u = u << 8 ^ r[(u >>> 24 ^ d) & 255];
      };
    };
    return o;
  }()), Ee;
}
const yt = "2.0.0", gt = "MIT", bt = {
  version: yt,
  license: gt
};
var Be, Ue;
function wt() {
  if (Ue) return Be;
  Ue = 1;
  var r = ft(), o = pt(), u = xt(), d = bt, h = 20, x = 258, p = 0, s = 1, y = 2, m = 6, E = 50, F = "314159265359", $ = "177245385090", _ = function(f, g) {
    var S = f[g], w;
    for (w = g; w > 0; w--)
      f[w] = f[w - 1];
    return f[0] = S, S;
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
  }, B = {};
  B[b.LAST_BLOCK] = "Bad file checksum", B[b.NOT_BZIP_DATA] = "Not bzip data", B[b.UNEXPECTED_INPUT_EOF] = "Unexpected input EOF", B[b.UNEXPECTED_OUTPUT_EOF] = "Unexpected output EOF", B[b.DATA_ERROR] = "Data error", B[b.OUT_OF_MEMORY] = "Out of memory", B[b.OBSOLETE_INPUT] = "Obsolete (pre 0.9.5) bzip format not supported.";
  var v = function(f, g) {
    var S = B[f] || "unknown error";
    g && (S += ": " + g);
    var w = new TypeError(S);
    throw w.errorCode = f, w;
  }, A = function(f, g) {
    this.writePos = this.writeCurrent = this.writeCount = 0, this._start_bunzip(f, g);
  };
  A.prototype._init_block = function() {
    var f = this._get_next_block();
    return f ? (this.blockCRC = new u(), !0) : (this.writeCount = -1, !1);
  }, A.prototype._start_bunzip = function(f, g) {
    var S = new Buffer(4);
    (f.read(S, 0, 4) !== 4 || String.fromCharCode(S[0], S[1], S[2]) !== "BZh") && v(b.NOT_BZIP_DATA, "bad magic");
    var w = S[3] - 48;
    (w < 1 || w > 9) && v(b.NOT_BZIP_DATA, "level out of range"), this.reader = new r(f), this.dbufSize = 1e5 * w, this.nextoutput = 0, this.outputStream = g, this.streamCRC = 0;
  }, A.prototype._get_next_block = function() {
    var f, g, S, w = this.reader, U = w.pi();
    if (U === $)
      return !1;
    U !== F && v(b.NOT_BZIP_DATA), this.targetBlockCRC = w.read(32) >>> 0, this.streamCRC = (this.targetBlockCRC ^ (this.streamCRC << 1 | this.streamCRC >>> 31)) >>> 0, w.read(1) && v(b.OBSOLETE_INPUT);
    var C = w.read(24);
    C > this.dbufSize && v(b.DATA_ERROR, "initial position out of bounds");
    var R = w.read(16), G = new Buffer(256), j = 0;
    for (f = 0; f < 16; f++)
      if (R & 1 << 15 - f) {
        var ue = f * 16;
        for (S = w.read(16), g = 0; g < 16; g++)
          S & 1 << 15 - g && (G[j++] = ue + g);
      }
    var te = w.read(3);
    (te < y || te > m) && v(b.DATA_ERROR);
    var oe = w.read(15);
    oe === 0 && v(b.DATA_ERROR);
    var ae = new Buffer(256);
    for (f = 0; f < te; f++)
      ae[f] = f;
    var fe = new Buffer(oe);
    for (f = 0; f < oe; f++) {
      for (g = 0; w.read(1); g++)
        g >= te && v(b.DATA_ERROR);
      fe[f] = _(ae, g);
    }
    var X = j + 2, pe = [], z;
    for (g = 0; g < te; g++) {
      var k = new Buffer(X), M = new Uint16Array(h + 1);
      for (R = w.read(5), f = 0; f < X; f++) {
        for (; (R < 1 || R > h) && v(b.DATA_ERROR), !!w.read(1); )
          w.read(1) ? R-- : R++;
        k[f] = R;
      }
      var W, Z;
      for (W = Z = k[0], f = 1; f < X; f++)
        k[f] > Z ? Z = k[f] : k[f] < W && (W = k[f]);
      z = {}, pe.push(z), z.permute = new Uint16Array(x), z.limit = new Uint32Array(h + 2), z.base = new Uint32Array(h + 1), z.minLen = W, z.maxLen = Z;
      var K = 0;
      for (f = W; f <= Z; f++)
        for (M[f] = z.limit[f] = 0, R = 0; R < X; R++)
          k[R] === f && (z.permute[K++] = R);
      for (f = 0; f < X; f++)
        M[k[f]]++;
      for (K = R = 0, f = W; f < Z; f++)
        K += M[f], z.limit[f] = K - 1, K <<= 1, R += M[f], z.base[f + 1] = K - R;
      z.limit[Z + 1] = Number.MAX_VALUE, z.limit[Z] = K + M[Z] - 1, z.base[W] = 0;
    }
    var ee = new Uint32Array(256);
    for (f = 0; f < 256; f++)
      ae[f] = f;
    var J = 0, q = 0, ce = 0, V, se = this.dbuf = new Uint32Array(this.dbufSize);
    for (X = 0; ; ) {
      for (X-- || (X = E - 1, ce >= oe && v(b.DATA_ERROR), z = pe[fe[ce++]]), f = z.minLen, g = w.read(f); f > z.maxLen && v(b.DATA_ERROR), !(g <= z.limit[f]); f++)
        g = g << 1 | w.read(1);
      g -= z.base[f], (g < 0 || g >= x) && v(b.DATA_ERROR);
      var re = z.permute[g];
      if (re === p || re === s) {
        J || (J = 1, R = 0), re === p ? R += J : R += 2 * J, J <<= 1;
        continue;
      }
      if (J)
        for (J = 0, q + R > this.dbufSize && v(b.DATA_ERROR), V = G[ae[0]], ee[V] += R; R--; )
          se[q++] = V;
      if (re > j)
        break;
      q >= this.dbufSize && v(b.DATA_ERROR), f = re - 1, V = _(ae, f), V = G[V], ee[V]++, se[q++] = V;
    }
    for ((C < 0 || C >= q) && v(b.DATA_ERROR), g = 0, f = 0; f < 256; f++)
      S = g + ee[f], ee[f] = g, g = S;
    for (f = 0; f < q; f++)
      V = se[f] & 255, se[ee[V]] |= f << 8, ee[V]++;
    var Y = 0, ie = 0, xe = 0;
    return q && (Y = se[C], ie = Y & 255, Y >>= 8, xe = -1), this.writePos = Y, this.writeCurrent = ie, this.writeCount = q, this.writeRun = xe, !0;
  }, A.prototype._read_bunzip = function(f, g) {
    var S, w, U;
    if (this.writeCount < 0)
      return 0;
    var C = this.dbuf, R = this.writePos, G = this.writeCurrent, j = this.writeCount;
    this.outputsize;
    for (var ue = this.writeRun; j; ) {
      for (j--, w = G, R = C[R], G = R & 255, R >>= 8, ue++ === 3 ? (S = G, U = w, G = -1) : (S = 1, U = G), this.blockCRC.updateCRCRun(U, S); S--; )
        this.outputStream.writeByte(U), this.nextoutput++;
      G != w && (ue = 0);
    }
    return this.writeCount = j, this.blockCRC.getCRC() !== this.targetBlockCRC && v(b.DATA_ERROR, "Bad block CRC (got " + this.blockCRC.getCRC().toString(16) + " expected " + this.targetBlockCRC.toString(16) + ")"), this.nextoutput;
  };
  var T = function(f) {
    if ("readByte" in f)
      return f;
    var g = new o();
    return g.pos = 0, g.readByte = function() {
      return f[this.pos++];
    }, g.seek = function(S) {
      this.pos = S;
    }, g.eof = function() {
      return this.pos >= f.length;
    }, g;
  }, H = function(f) {
    var g = new o(), S = !0;
    if (f)
      if (typeof f == "number")
        g.buffer = new Buffer(f), S = !1;
      else {
        if ("writeByte" in f)
          return f;
        g.buffer = f, S = !1;
      }
    else
      g.buffer = new Buffer(16384);
    return g.pos = 0, g.writeByte = function(w) {
      if (S && this.pos >= this.buffer.length) {
        var U = new Buffer(this.buffer.length * 2);
        this.buffer.copy(U), this.buffer = U;
      }
      this.buffer[this.pos++] = w;
    }, g.getBuffer = function() {
      if (this.pos !== this.buffer.length) {
        if (!S)
          throw new TypeError("outputsize does not match decoded input");
        var w = new Buffer(this.pos);
        this.buffer.copy(w, 0, 0, this.pos), this.buffer = w;
      }
      return this.buffer;
    }, g._coerced = !0, g;
  };
  return A.Err = b, A.decode = function(f, g, S) {
    for (var w = T(f), U = H(g), C = new A(w, U); !("eof" in w && w.eof()); )
      if (C._init_block())
        C._read_bunzip();
      else {
        var R = C.reader.read(32) >>> 0;
        if (R !== C.streamCRC && v(b.DATA_ERROR, "Bad stream CRC (got " + C.streamCRC.toString(16) + " expected " + R.toString(16) + ")"), S && "eof" in w && !w.eof())
          C._start_bunzip(w, U);
        else break;
      }
    if ("getBuffer" in U)
      return U.getBuffer();
  }, A.decodeBlock = function(f, g, S) {
    var w = T(f), U = H(S), C = new A(w, U);
    C.reader.seek(g);
    var R = C._get_next_block();
    if (R && (C.blockCRC = new u(), C.writeCopies = 0, C._read_bunzip()), "getBuffer" in U)
      return U.getBuffer();
  }, A.table = function(f, g, S) {
    var w = new o();
    w.delegate = T(f), w.pos = 0, w.readByte = function() {
      return this.pos++, this.delegate.readByte();
    }, w.delegate.eof && (w.eof = w.delegate.eof.bind(w.delegate));
    var U = new o();
    U.pos = 0, U.writeByte = function() {
      this.pos++;
    };
    for (var C = new A(w, U), R = C.dbufSize; !("eof" in w && w.eof()); ) {
      var G = w.pos * 8 + C.reader.bitOffset;
      if (C.reader.hasByte && (G -= 8), C._init_block()) {
        var j = U.pos;
        C._read_bunzip(), g(G, U.pos - j);
      } else if (C.reader.read(32), S && "eof" in w && !w.eof())
        C._start_bunzip(w, U), console.assert(
          C.dbufSize === R,
          "shouldn't change block size within multistream file"
        );
      else break;
    }
  }, A.Stream = o, A.version = d.version, A.license = d.license, Be = A, Be;
}
var _t = wt();
const mt = /* @__PURE__ */ lt(_t);
var ve = {}, he = {}, Te;
function Et() {
  if (Te) return he;
  Te = 1, he.byteLength = s, he.toByteArray = m, he.fromByteArray = $;
  for (var r = [], o = [], u = typeof Uint8Array < "u" ? Uint8Array : Array, d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", h = 0, x = d.length; h < x; ++h)
    r[h] = d[h], o[d.charCodeAt(h)] = h;
  o[45] = 62, o[95] = 63;
  function p(_) {
    var b = _.length;
    if (b % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var B = _.indexOf("=");
    B === -1 && (B = b);
    var v = B === b ? 0 : 4 - B % 4;
    return [B, v];
  }
  function s(_) {
    var b = p(_), B = b[0], v = b[1];
    return (B + v) * 3 / 4 - v;
  }
  function y(_, b, B) {
    return (b + B) * 3 / 4 - B;
  }
  function m(_) {
    var b, B = p(_), v = B[0], A = B[1], T = new u(y(_, v, A)), H = 0, f = A > 0 ? v - 4 : v, g;
    for (g = 0; g < f; g += 4)
      b = o[_.charCodeAt(g)] << 18 | o[_.charCodeAt(g + 1)] << 12 | o[_.charCodeAt(g + 2)] << 6 | o[_.charCodeAt(g + 3)], T[H++] = b >> 16 & 255, T[H++] = b >> 8 & 255, T[H++] = b & 255;
    return A === 2 && (b = o[_.charCodeAt(g)] << 2 | o[_.charCodeAt(g + 1)] >> 4, T[H++] = b & 255), A === 1 && (b = o[_.charCodeAt(g)] << 10 | o[_.charCodeAt(g + 1)] << 4 | o[_.charCodeAt(g + 2)] >> 2, T[H++] = b >> 8 & 255, T[H++] = b & 255), T;
  }
  function E(_) {
    return r[_ >> 18 & 63] + r[_ >> 12 & 63] + r[_ >> 6 & 63] + r[_ & 63];
  }
  function F(_, b, B) {
    for (var v, A = [], T = b; T < B; T += 3)
      v = (_[T] << 16 & 16711680) + (_[T + 1] << 8 & 65280) + (_[T + 2] & 255), A.push(E(v));
    return A.join("");
  }
  function $(_) {
    for (var b, B = _.length, v = B % 3, A = [], T = 16383, H = 0, f = B - v; H < f; H += T)
      A.push(F(_, H, H + T > f ? f : H + T));
    return v === 1 ? (b = _[B - 1], A.push(
      r[b >> 2] + r[b << 4 & 63] + "=="
    )) : v === 2 && (b = (_[B - 2] << 8) + _[B - 1], A.push(
      r[b >> 10] + r[b >> 4 & 63] + r[b << 2 & 63] + "="
    )), A.join("");
  }
  return he;
}
var ge = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
var ke;
function Bt() {
  return ke || (ke = 1, ge.read = function(r, o, u, d, h) {
    var x, p, s = h * 8 - d - 1, y = (1 << s) - 1, m = y >> 1, E = -7, F = u ? h - 1 : 0, $ = u ? -1 : 1, _ = r[o + F];
    for (F += $, x = _ & (1 << -E) - 1, _ >>= -E, E += s; E > 0; x = x * 256 + r[o + F], F += $, E -= 8)
      ;
    for (p = x & (1 << -E) - 1, x >>= -E, E += d; E > 0; p = p * 256 + r[o + F], F += $, E -= 8)
      ;
    if (x === 0)
      x = 1 - m;
    else {
      if (x === y)
        return p ? NaN : (_ ? -1 : 1) * (1 / 0);
      p = p + Math.pow(2, d), x = x - m;
    }
    return (_ ? -1 : 1) * p * Math.pow(2, x - d);
  }, ge.write = function(r, o, u, d, h, x) {
    var p, s, y, m = x * 8 - h - 1, E = (1 << m) - 1, F = E >> 1, $ = h === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, _ = d ? 0 : x - 1, b = d ? 1 : -1, B = o < 0 || o === 0 && 1 / o < 0 ? 1 : 0;
    for (o = Math.abs(o), isNaN(o) || o === 1 / 0 ? (s = isNaN(o) ? 1 : 0, p = E) : (p = Math.floor(Math.log(o) / Math.LN2), o * (y = Math.pow(2, -p)) < 1 && (p--, y *= 2), p + F >= 1 ? o += $ / y : o += $ * Math.pow(2, 1 - F), o * y >= 2 && (p++, y /= 2), p + F >= E ? (s = 0, p = E) : p + F >= 1 ? (s = (o * y - 1) * Math.pow(2, h), p = p + F) : (s = o * Math.pow(2, F - 1) * Math.pow(2, h), p = 0)); h >= 8; r[u + _] = s & 255, _ += b, s /= 256, h -= 8)
      ;
    for (p = p << h | s, m += h; m > 0; r[u + _] = p & 255, _ += b, p /= 256, m -= 8)
      ;
    r[u + _ - b] |= B * 128;
  }), ge;
}
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var De;
function vt() {
  return De || (De = 1, function(r) {
    const o = Et(), u = Bt(), d = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    r.Buffer = s, r.SlowBuffer = T, r.INSPECT_MAX_BYTES = 50;
    const h = 2147483647;
    r.kMaxLength = h, s.TYPED_ARRAY_SUPPORT = x(), !s.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
      "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
    );
    function x() {
      try {
        const i = new Uint8Array(1), e = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(i, e), i.foo() === 42;
      } catch {
        return !1;
      }
    }
    Object.defineProperty(s.prototype, "parent", {
      enumerable: !0,
      get: function() {
        if (s.isBuffer(this))
          return this.buffer;
      }
    }), Object.defineProperty(s.prototype, "offset", {
      enumerable: !0,
      get: function() {
        if (s.isBuffer(this))
          return this.byteOffset;
      }
    });
    function p(i) {
      if (i > h)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
      const e = new Uint8Array(i);
      return Object.setPrototypeOf(e, s.prototype), e;
    }
    function s(i, e, t) {
      if (typeof i == "number") {
        if (typeof e == "string")
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        return F(i);
      }
      return y(i, e, t);
    }
    s.poolSize = 8192;
    function y(i, e, t) {
      if (typeof i == "string")
        return $(i, e);
      if (ArrayBuffer.isView(i))
        return b(i);
      if (i == null)
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i
        );
      if (Q(i, ArrayBuffer) || i && Q(i.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (Q(i, SharedArrayBuffer) || i && Q(i.buffer, SharedArrayBuffer)))
        return B(i, e, t);
      if (typeof i == "number")
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      const n = i.valueOf && i.valueOf();
      if (n != null && n !== i)
        return s.from(n, e, t);
      const a = v(i);
      if (a) return a;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof i[Symbol.toPrimitive] == "function")
        return s.from(i[Symbol.toPrimitive]("string"), e, t);
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i
      );
    }
    s.from = function(i, e, t) {
      return y(i, e, t);
    }, Object.setPrototypeOf(s.prototype, Uint8Array.prototype), Object.setPrototypeOf(s, Uint8Array);
    function m(i) {
      if (typeof i != "number")
        throw new TypeError('"size" argument must be of type number');
      if (i < 0)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
    }
    function E(i, e, t) {
      return m(i), i <= 0 ? p(i) : e !== void 0 ? typeof t == "string" ? p(i).fill(e, t) : p(i).fill(e) : p(i);
    }
    s.alloc = function(i, e, t) {
      return E(i, e, t);
    };
    function F(i) {
      return m(i), p(i < 0 ? 0 : A(i) | 0);
    }
    s.allocUnsafe = function(i) {
      return F(i);
    }, s.allocUnsafeSlow = function(i) {
      return F(i);
    };
    function $(i, e) {
      if ((typeof e != "string" || e === "") && (e = "utf8"), !s.isEncoding(e))
        throw new TypeError("Unknown encoding: " + e);
      const t = H(i, e) | 0;
      let n = p(t);
      const a = n.write(i, e);
      return a !== t && (n = n.slice(0, a)), n;
    }
    function _(i) {
      const e = i.length < 0 ? 0 : A(i.length) | 0, t = p(e);
      for (let n = 0; n < e; n += 1)
        t[n] = i[n] & 255;
      return t;
    }
    function b(i) {
      if (Q(i, Uint8Array)) {
        const e = new Uint8Array(i);
        return B(e.buffer, e.byteOffset, e.byteLength);
      }
      return _(i);
    }
    function B(i, e, t) {
      if (e < 0 || i.byteLength < e)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (i.byteLength < e + (t || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      let n;
      return e === void 0 && t === void 0 ? n = new Uint8Array(i) : t === void 0 ? n = new Uint8Array(i, e) : n = new Uint8Array(i, e, t), Object.setPrototypeOf(n, s.prototype), n;
    }
    function v(i) {
      if (s.isBuffer(i)) {
        const e = A(i.length) | 0, t = p(e);
        return t.length === 0 || i.copy(t, 0, 0, e), t;
      }
      if (i.length !== void 0)
        return typeof i.length != "number" || we(i.length) ? p(0) : _(i);
      if (i.type === "Buffer" && Array.isArray(i.data))
        return _(i.data);
    }
    function A(i) {
      if (i >= h)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + h.toString(16) + " bytes");
      return i | 0;
    }
    function T(i) {
      return +i != i && (i = 0), s.alloc(+i);
    }
    s.isBuffer = function(e) {
      return e != null && e._isBuffer === !0 && e !== s.prototype;
    }, s.compare = function(e, t) {
      if (Q(e, Uint8Array) && (e = s.from(e, e.offset, e.byteLength)), Q(t, Uint8Array) && (t = s.from(t, t.offset, t.byteLength)), !s.isBuffer(e) || !s.isBuffer(t))
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      if (e === t) return 0;
      let n = e.length, a = t.length;
      for (let c = 0, l = Math.min(n, a); c < l; ++c)
        if (e[c] !== t[c]) {
          n = e[c], a = t[c];
          break;
        }
      return n < a ? -1 : a < n ? 1 : 0;
    }, s.isEncoding = function(e) {
      switch (String(e).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return !0;
        default:
          return !1;
      }
    }, s.concat = function(e, t) {
      if (!Array.isArray(e))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (e.length === 0)
        return s.alloc(0);
      let n;
      if (t === void 0)
        for (t = 0, n = 0; n < e.length; ++n)
          t += e[n].length;
      const a = s.allocUnsafe(t);
      let c = 0;
      for (n = 0; n < e.length; ++n) {
        let l = e[n];
        if (Q(l, Uint8Array))
          c + l.length > a.length ? (s.isBuffer(l) || (l = s.from(l)), l.copy(a, c)) : Uint8Array.prototype.set.call(
            a,
            l,
            c
          );
        else if (s.isBuffer(l))
          l.copy(a, c);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        c += l.length;
      }
      return a;
    };
    function H(i, e) {
      if (s.isBuffer(i))
        return i.length;
      if (ArrayBuffer.isView(i) || Q(i, ArrayBuffer))
        return i.byteLength;
      if (typeof i != "string")
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof i
        );
      const t = i.length, n = arguments.length > 2 && arguments[2] === !0;
      if (!n && t === 0) return 0;
      let a = !1;
      for (; ; )
        switch (e) {
          case "ascii":
          case "latin1":
          case "binary":
            return t;
          case "utf8":
          case "utf-8":
            return be(i).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return t * 2;
          case "hex":
            return t >>> 1;
          case "base64":
            return Ie(i).length;
          default:
            if (a)
              return n ? -1 : be(i).length;
            e = ("" + e).toLowerCase(), a = !0;
        }
    }
    s.byteLength = H;
    function f(i, e, t) {
      let n = !1;
      if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e))
        return "";
      for (i || (i = "utf8"); ; )
        switch (i) {
          case "hex":
            return pe(this, e, t);
          case "utf8":
          case "utf-8":
            return te(this, e, t);
          case "ascii":
            return fe(this, e, t);
          case "latin1":
          case "binary":
            return X(this, e, t);
          case "base64":
            return ue(this, e, t);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return z(this, e, t);
          default:
            if (n) throw new TypeError("Unknown encoding: " + i);
            i = (i + "").toLowerCase(), n = !0;
        }
    }
    s.prototype._isBuffer = !0;
    function g(i, e, t) {
      const n = i[e];
      i[e] = i[t], i[t] = n;
    }
    s.prototype.swap16 = function() {
      const e = this.length;
      if (e % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (let t = 0; t < e; t += 2)
        g(this, t, t + 1);
      return this;
    }, s.prototype.swap32 = function() {
      const e = this.length;
      if (e % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (let t = 0; t < e; t += 4)
        g(this, t, t + 3), g(this, t + 1, t + 2);
      return this;
    }, s.prototype.swap64 = function() {
      const e = this.length;
      if (e % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0; t < e; t += 8)
        g(this, t, t + 7), g(this, t + 1, t + 6), g(this, t + 2, t + 5), g(this, t + 3, t + 4);
      return this;
    }, s.prototype.toString = function() {
      const e = this.length;
      return e === 0 ? "" : arguments.length === 0 ? te(this, 0, e) : f.apply(this, arguments);
    }, s.prototype.toLocaleString = s.prototype.toString, s.prototype.equals = function(e) {
      if (!s.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
      return this === e ? !0 : s.compare(this, e) === 0;
    }, s.prototype.inspect = function() {
      let e = "";
      const t = r.INSPECT_MAX_BYTES;
      return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
    }, d && (s.prototype[d] = s.prototype.inspect), s.prototype.compare = function(e, t, n, a, c) {
      if (Q(e, Uint8Array) && (e = s.from(e, e.offset, e.byteLength)), !s.isBuffer(e))
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e
        );
      if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), a === void 0 && (a = 0), c === void 0 && (c = this.length), t < 0 || n > e.length || a < 0 || c > this.length)
        throw new RangeError("out of range index");
      if (a >= c && t >= n)
        return 0;
      if (a >= c)
        return -1;
      if (t >= n)
        return 1;
      if (t >>>= 0, n >>>= 0, a >>>= 0, c >>>= 0, this === e) return 0;
      let l = c - a, I = n - t;
      const N = Math.min(l, I), O = this.slice(a, c), L = e.slice(t, n);
      for (let D = 0; D < N; ++D)
        if (O[D] !== L[D]) {
          l = O[D], I = L[D];
          break;
        }
      return l < I ? -1 : I < l ? 1 : 0;
    };
    function S(i, e, t, n, a) {
      if (i.length === 0) return -1;
      if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, we(t) && (t = a ? 0 : i.length - 1), t < 0 && (t = i.length + t), t >= i.length) {
        if (a) return -1;
        t = i.length - 1;
      } else if (t < 0)
        if (a) t = 0;
        else return -1;
      if (typeof e == "string" && (e = s.from(e, n)), s.isBuffer(e))
        return e.length === 0 ? -1 : w(i, e, t, n, a);
      if (typeof e == "number")
        return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? a ? Uint8Array.prototype.indexOf.call(i, e, t) : Uint8Array.prototype.lastIndexOf.call(i, e, t) : w(i, [e], t, n, a);
      throw new TypeError("val must be string, number or Buffer");
    }
    function w(i, e, t, n, a) {
      let c = 1, l = i.length, I = e.length;
      if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
        if (i.length < 2 || e.length < 2)
          return -1;
        c = 2, l /= 2, I /= 2, t /= 2;
      }
      function N(L, D) {
        return c === 1 ? L[D] : L.readUInt16BE(D * c);
      }
      let O;
      if (a) {
        let L = -1;
        for (O = t; O < l; O++)
          if (N(i, O) === N(e, L === -1 ? 0 : O - L)) {
            if (L === -1 && (L = O), O - L + 1 === I) return L * c;
          } else
            L !== -1 && (O -= O - L), L = -1;
      } else
        for (t + I > l && (t = l - I), O = t; O >= 0; O--) {
          let L = !0;
          for (let D = 0; D < I; D++)
            if (N(i, O + D) !== N(e, D)) {
              L = !1;
              break;
            }
          if (L) return O;
        }
      return -1;
    }
    s.prototype.includes = function(e, t, n) {
      return this.indexOf(e, t, n) !== -1;
    }, s.prototype.indexOf = function(e, t, n) {
      return S(this, e, t, n, !0);
    }, s.prototype.lastIndexOf = function(e, t, n) {
      return S(this, e, t, n, !1);
    };
    function U(i, e, t, n) {
      t = Number(t) || 0;
      const a = i.length - t;
      n ? (n = Number(n), n > a && (n = a)) : n = a;
      const c = e.length;
      n > c / 2 && (n = c / 2);
      let l;
      for (l = 0; l < n; ++l) {
        const I = parseInt(e.substr(l * 2, 2), 16);
        if (we(I)) return l;
        i[t + l] = I;
      }
      return l;
    }
    function C(i, e, t, n) {
      return ye(be(e, i.length - t), i, t, n);
    }
    function R(i, e, t, n) {
      return ye(Me(e), i, t, n);
    }
    function G(i, e, t, n) {
      return ye(Ie(e), i, t, n);
    }
    function j(i, e, t, n) {
      return ye($e(e, i.length - t), i, t, n);
    }
    s.prototype.write = function(e, t, n, a) {
      if (t === void 0)
        a = "utf8", n = this.length, t = 0;
      else if (n === void 0 && typeof t == "string")
        a = t, n = this.length, t = 0;
      else if (isFinite(t))
        t = t >>> 0, isFinite(n) ? (n = n >>> 0, a === void 0 && (a = "utf8")) : (a = n, n = void 0);
      else
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      const c = this.length - t;
      if ((n === void 0 || n > c) && (n = c), e.length > 0 && (n < 0 || t < 0) || t > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      a || (a = "utf8");
      let l = !1;
      for (; ; )
        switch (a) {
          case "hex":
            return U(this, e, t, n);
          case "utf8":
          case "utf-8":
            return C(this, e, t, n);
          case "ascii":
          case "latin1":
          case "binary":
            return R(this, e, t, n);
          case "base64":
            return G(this, e, t, n);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return j(this, e, t, n);
          default:
            if (l) throw new TypeError("Unknown encoding: " + a);
            a = ("" + a).toLowerCase(), l = !0;
        }
    }, s.prototype.toJSON = function() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function ue(i, e, t) {
      return e === 0 && t === i.length ? o.fromByteArray(i) : o.fromByteArray(i.slice(e, t));
    }
    function te(i, e, t) {
      t = Math.min(i.length, t);
      const n = [];
      let a = e;
      for (; a < t; ) {
        const c = i[a];
        let l = null, I = c > 239 ? 4 : c > 223 ? 3 : c > 191 ? 2 : 1;
        if (a + I <= t) {
          let N, O, L, D;
          switch (I) {
            case 1:
              c < 128 && (l = c);
              break;
            case 2:
              N = i[a + 1], (N & 192) === 128 && (D = (c & 31) << 6 | N & 63, D > 127 && (l = D));
              break;
            case 3:
              N = i[a + 1], O = i[a + 2], (N & 192) === 128 && (O & 192) === 128 && (D = (c & 15) << 12 | (N & 63) << 6 | O & 63, D > 2047 && (D < 55296 || D > 57343) && (l = D));
              break;
            case 4:
              N = i[a + 1], O = i[a + 2], L = i[a + 3], (N & 192) === 128 && (O & 192) === 128 && (L & 192) === 128 && (D = (c & 15) << 18 | (N & 63) << 12 | (O & 63) << 6 | L & 63, D > 65535 && D < 1114112 && (l = D));
          }
        }
        l === null ? (l = 65533, I = 1) : l > 65535 && (l -= 65536, n.push(l >>> 10 & 1023 | 55296), l = 56320 | l & 1023), n.push(l), a += I;
      }
      return ae(n);
    }
    const oe = 4096;
    function ae(i) {
      const e = i.length;
      if (e <= oe)
        return String.fromCharCode.apply(String, i);
      let t = "", n = 0;
      for (; n < e; )
        t += String.fromCharCode.apply(
          String,
          i.slice(n, n += oe)
        );
      return t;
    }
    function fe(i, e, t) {
      let n = "";
      t = Math.min(i.length, t);
      for (let a = e; a < t; ++a)
        n += String.fromCharCode(i[a] & 127);
      return n;
    }
    function X(i, e, t) {
      let n = "";
      t = Math.min(i.length, t);
      for (let a = e; a < t; ++a)
        n += String.fromCharCode(i[a]);
      return n;
    }
    function pe(i, e, t) {
      const n = i.length;
      (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
      let a = "";
      for (let c = e; c < t; ++c)
        a += He[i[c]];
      return a;
    }
    function z(i, e, t) {
      const n = i.slice(e, t);
      let a = "";
      for (let c = 0; c < n.length - 1; c += 2)
        a += String.fromCharCode(n[c] + n[c + 1] * 256);
      return a;
    }
    s.prototype.slice = function(e, t) {
      const n = this.length;
      e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
      const a = this.subarray(e, t);
      return Object.setPrototypeOf(a, s.prototype), a;
    };
    function k(i, e, t) {
      if (i % 1 !== 0 || i < 0) throw new RangeError("offset is not uint");
      if (i + e > t) throw new RangeError("Trying to access beyond buffer length");
    }
    s.prototype.readUintLE = s.prototype.readUIntLE = function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || k(e, t, this.length);
      let a = this[e], c = 1, l = 0;
      for (; ++l < t && (c *= 256); )
        a += this[e + l] * c;
      return a;
    }, s.prototype.readUintBE = s.prototype.readUIntBE = function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || k(e, t, this.length);
      let a = this[e + --t], c = 1;
      for (; t > 0 && (c *= 256); )
        a += this[e + --t] * c;
      return a;
    }, s.prototype.readUint8 = s.prototype.readUInt8 = function(e, t) {
      return e = e >>> 0, t || k(e, 1, this.length), this[e];
    }, s.prototype.readUint16LE = s.prototype.readUInt16LE = function(e, t) {
      return e = e >>> 0, t || k(e, 2, this.length), this[e] | this[e + 1] << 8;
    }, s.prototype.readUint16BE = s.prototype.readUInt16BE = function(e, t) {
      return e = e >>> 0, t || k(e, 2, this.length), this[e] << 8 | this[e + 1];
    }, s.prototype.readUint32LE = s.prototype.readUInt32LE = function(e, t) {
      return e = e >>> 0, t || k(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
    }, s.prototype.readUint32BE = s.prototype.readUInt32BE = function(e, t) {
      return e = e >>> 0, t || k(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
    }, s.prototype.readBigUInt64LE = ne(function(e) {
      e = e >>> 0, Y(e, "offset");
      const t = this[e], n = this[e + 7];
      (t === void 0 || n === void 0) && ie(e, this.length - 8);
      const a = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, c = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
      return BigInt(a) + (BigInt(c) << BigInt(32));
    }), s.prototype.readBigUInt64BE = ne(function(e) {
      e = e >>> 0, Y(e, "offset");
      const t = this[e], n = this[e + 7];
      (t === void 0 || n === void 0) && ie(e, this.length - 8);
      const a = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], c = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
      return (BigInt(a) << BigInt(32)) + BigInt(c);
    }), s.prototype.readIntLE = function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || k(e, t, this.length);
      let a = this[e], c = 1, l = 0;
      for (; ++l < t && (c *= 256); )
        a += this[e + l] * c;
      return c *= 128, a >= c && (a -= Math.pow(2, 8 * t)), a;
    }, s.prototype.readIntBE = function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || k(e, t, this.length);
      let a = t, c = 1, l = this[e + --a];
      for (; a > 0 && (c *= 256); )
        l += this[e + --a] * c;
      return c *= 128, l >= c && (l -= Math.pow(2, 8 * t)), l;
    }, s.prototype.readInt8 = function(e, t) {
      return e = e >>> 0, t || k(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
    }, s.prototype.readInt16LE = function(e, t) {
      e = e >>> 0, t || k(e, 2, this.length);
      const n = this[e] | this[e + 1] << 8;
      return n & 32768 ? n | 4294901760 : n;
    }, s.prototype.readInt16BE = function(e, t) {
      e = e >>> 0, t || k(e, 2, this.length);
      const n = this[e + 1] | this[e] << 8;
      return n & 32768 ? n | 4294901760 : n;
    }, s.prototype.readInt32LE = function(e, t) {
      return e = e >>> 0, t || k(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
    }, s.prototype.readInt32BE = function(e, t) {
      return e = e >>> 0, t || k(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
    }, s.prototype.readBigInt64LE = ne(function(e) {
      e = e >>> 0, Y(e, "offset");
      const t = this[e], n = this[e + 7];
      (t === void 0 || n === void 0) && ie(e, this.length - 8);
      const a = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
      return (BigInt(a) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
    }), s.prototype.readBigInt64BE = ne(function(e) {
      e = e >>> 0, Y(e, "offset");
      const t = this[e], n = this[e + 7];
      (t === void 0 || n === void 0) && ie(e, this.length - 8);
      const a = (t << 24) + // Overflow
      this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
      return (BigInt(a) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n);
    }), s.prototype.readFloatLE = function(e, t) {
      return e = e >>> 0, t || k(e, 4, this.length), u.read(this, e, !0, 23, 4);
    }, s.prototype.readFloatBE = function(e, t) {
      return e = e >>> 0, t || k(e, 4, this.length), u.read(this, e, !1, 23, 4);
    }, s.prototype.readDoubleLE = function(e, t) {
      return e = e >>> 0, t || k(e, 8, this.length), u.read(this, e, !0, 52, 8);
    }, s.prototype.readDoubleBE = function(e, t) {
      return e = e >>> 0, t || k(e, 8, this.length), u.read(this, e, !1, 52, 8);
    };
    function M(i, e, t, n, a, c) {
      if (!s.isBuffer(i)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (e > a || e < c) throw new RangeError('"value" argument is out of bounds');
      if (t + n > i.length) throw new RangeError("Index out of range");
    }
    s.prototype.writeUintLE = s.prototype.writeUIntLE = function(e, t, n, a) {
      if (e = +e, t = t >>> 0, n = n >>> 0, !a) {
        const I = Math.pow(2, 8 * n) - 1;
        M(this, e, t, n, I, 0);
      }
      let c = 1, l = 0;
      for (this[t] = e & 255; ++l < n && (c *= 256); )
        this[t + l] = e / c & 255;
      return t + n;
    }, s.prototype.writeUintBE = s.prototype.writeUIntBE = function(e, t, n, a) {
      if (e = +e, t = t >>> 0, n = n >>> 0, !a) {
        const I = Math.pow(2, 8 * n) - 1;
        M(this, e, t, n, I, 0);
      }
      let c = n - 1, l = 1;
      for (this[t + c] = e & 255; --c >= 0 && (l *= 256); )
        this[t + c] = e / l & 255;
      return t + n;
    }, s.prototype.writeUint8 = s.prototype.writeUInt8 = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
    }, s.prototype.writeUint16LE = s.prototype.writeUInt16LE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
    }, s.prototype.writeUint16BE = s.prototype.writeUInt16BE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
    }, s.prototype.writeUint32LE = s.prototype.writeUInt32LE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
    }, s.prototype.writeUint32BE = s.prototype.writeUInt32BE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
    };
    function W(i, e, t, n, a) {
      re(e, n, a, i, t, 7);
      let c = Number(e & BigInt(4294967295));
      i[t++] = c, c = c >> 8, i[t++] = c, c = c >> 8, i[t++] = c, c = c >> 8, i[t++] = c;
      let l = Number(e >> BigInt(32) & BigInt(4294967295));
      return i[t++] = l, l = l >> 8, i[t++] = l, l = l >> 8, i[t++] = l, l = l >> 8, i[t++] = l, t;
    }
    function Z(i, e, t, n, a) {
      re(e, n, a, i, t, 7);
      let c = Number(e & BigInt(4294967295));
      i[t + 7] = c, c = c >> 8, i[t + 6] = c, c = c >> 8, i[t + 5] = c, c = c >> 8, i[t + 4] = c;
      let l = Number(e >> BigInt(32) & BigInt(4294967295));
      return i[t + 3] = l, l = l >> 8, i[t + 2] = l, l = l >> 8, i[t + 1] = l, l = l >> 8, i[t] = l, t + 8;
    }
    s.prototype.writeBigUInt64LE = ne(function(e, t = 0) {
      return W(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }), s.prototype.writeBigUInt64BE = ne(function(e, t = 0) {
      return Z(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }), s.prototype.writeIntLE = function(e, t, n, a) {
      if (e = +e, t = t >>> 0, !a) {
        const N = Math.pow(2, 8 * n - 1);
        M(this, e, t, n, N - 1, -N);
      }
      let c = 0, l = 1, I = 0;
      for (this[t] = e & 255; ++c < n && (l *= 256); )
        e < 0 && I === 0 && this[t + c - 1] !== 0 && (I = 1), this[t + c] = (e / l >> 0) - I & 255;
      return t + n;
    }, s.prototype.writeIntBE = function(e, t, n, a) {
      if (e = +e, t = t >>> 0, !a) {
        const N = Math.pow(2, 8 * n - 1);
        M(this, e, t, n, N - 1, -N);
      }
      let c = n - 1, l = 1, I = 0;
      for (this[t + c] = e & 255; --c >= 0 && (l *= 256); )
        e < 0 && I === 0 && this[t + c + 1] !== 0 && (I = 1), this[t + c] = (e / l >> 0) - I & 255;
      return t + n;
    }, s.prototype.writeInt8 = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
    }, s.prototype.writeInt16LE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
    }, s.prototype.writeInt16BE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
    }, s.prototype.writeInt32LE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
    }, s.prototype.writeInt32BE = function(e, t, n) {
      return e = +e, t = t >>> 0, n || M(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
    }, s.prototype.writeBigInt64LE = ne(function(e, t = 0) {
      return W(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }), s.prototype.writeBigInt64BE = ne(function(e, t = 0) {
      return Z(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function K(i, e, t, n, a, c) {
      if (t + n > i.length) throw new RangeError("Index out of range");
      if (t < 0) throw new RangeError("Index out of range");
    }
    function ee(i, e, t, n, a) {
      return e = +e, t = t >>> 0, a || K(i, e, t, 4), u.write(i, e, t, n, 23, 4), t + 4;
    }
    s.prototype.writeFloatLE = function(e, t, n) {
      return ee(this, e, t, !0, n);
    }, s.prototype.writeFloatBE = function(e, t, n) {
      return ee(this, e, t, !1, n);
    };
    function J(i, e, t, n, a) {
      return e = +e, t = t >>> 0, a || K(i, e, t, 8), u.write(i, e, t, n, 52, 8), t + 8;
    }
    s.prototype.writeDoubleLE = function(e, t, n) {
      return J(this, e, t, !0, n);
    }, s.prototype.writeDoubleBE = function(e, t, n) {
      return J(this, e, t, !1, n);
    }, s.prototype.copy = function(e, t, n, a) {
      if (!s.isBuffer(e)) throw new TypeError("argument should be a Buffer");
      if (n || (n = 0), !a && a !== 0 && (a = this.length), t >= e.length && (t = e.length), t || (t = 0), a > 0 && a < n && (a = n), a === n || e.length === 0 || this.length === 0) return 0;
      if (t < 0)
        throw new RangeError("targetStart out of bounds");
      if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
      if (a < 0) throw new RangeError("sourceEnd out of bounds");
      a > this.length && (a = this.length), e.length - t < a - n && (a = e.length - t + n);
      const c = a - n;
      return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, a) : Uint8Array.prototype.set.call(
        e,
        this.subarray(n, a),
        t
      ), c;
    }, s.prototype.fill = function(e, t, n, a) {
      if (typeof e == "string") {
        if (typeof t == "string" ? (a = t, t = 0, n = this.length) : typeof n == "string" && (a = n, n = this.length), a !== void 0 && typeof a != "string")
          throw new TypeError("encoding must be a string");
        if (typeof a == "string" && !s.isEncoding(a))
          throw new TypeError("Unknown encoding: " + a);
        if (e.length === 1) {
          const l = e.charCodeAt(0);
          (a === "utf8" && l < 128 || a === "latin1") && (e = l);
        }
      } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
      if (t < 0 || this.length < t || this.length < n)
        throw new RangeError("Out of range index");
      if (n <= t)
        return this;
      t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
      let c;
      if (typeof e == "number")
        for (c = t; c < n; ++c)
          this[c] = e;
      else {
        const l = s.isBuffer(e) ? e : s.from(e, a), I = l.length;
        if (I === 0)
          throw new TypeError('The value "' + e + '" is invalid for argument "value"');
        for (c = 0; c < n - t; ++c)
          this[c + t] = l[c % I];
      }
      return this;
    };
    const q = {};
    function ce(i, e, t) {
      q[i] = class extends t {
        constructor() {
          super(), Object.defineProperty(this, "message", {
            value: e.apply(this, arguments),
            writable: !0,
            configurable: !0
          }), this.name = `${this.name} [${i}]`, this.stack, delete this.name;
        }
        get code() {
          return i;
        }
        set code(a) {
          Object.defineProperty(this, "code", {
            configurable: !0,
            enumerable: !0,
            value: a,
            writable: !0
          });
        }
        toString() {
          return `${this.name} [${i}]: ${this.message}`;
        }
      };
    }
    ce(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(i) {
        return i ? `${i} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
      },
      RangeError
    ), ce(
      "ERR_INVALID_ARG_TYPE",
      function(i, e) {
        return `The "${i}" argument must be of type number. Received type ${typeof e}`;
      },
      TypeError
    ), ce(
      "ERR_OUT_OF_RANGE",
      function(i, e, t) {
        let n = `The value of "${i}" is out of range.`, a = t;
        return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? a = V(String(t)) : typeof t == "bigint" && (a = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (a = V(a)), a += "n"), n += ` It must be ${e}. Received ${a}`, n;
      },
      RangeError
    );
    function V(i) {
      let e = "", t = i.length;
      const n = i[0] === "-" ? 1 : 0;
      for (; t >= n + 4; t -= 3)
        e = `_${i.slice(t - 3, t)}${e}`;
      return `${i.slice(0, t)}${e}`;
    }
    function se(i, e, t) {
      Y(e, "offset"), (i[e] === void 0 || i[e + t] === void 0) && ie(e, i.length - (t + 1));
    }
    function re(i, e, t, n, a, c) {
      if (i > t || i < e) {
        const l = typeof e == "bigint" ? "n" : "";
        let I;
        throw e === 0 || e === BigInt(0) ? I = `>= 0${l} and < 2${l} ** ${(c + 1) * 8}${l}` : I = `>= -(2${l} ** ${(c + 1) * 8 - 1}${l}) and < 2 ** ${(c + 1) * 8 - 1}${l}`, new q.ERR_OUT_OF_RANGE("value", I, i);
      }
      se(n, a, c);
    }
    function Y(i, e) {
      if (typeof i != "number")
        throw new q.ERR_INVALID_ARG_TYPE(e, "number", i);
    }
    function ie(i, e, t) {
      throw Math.floor(i) !== i ? (Y(i, t), new q.ERR_OUT_OF_RANGE("offset", "an integer", i)) : e < 0 ? new q.ERR_BUFFER_OUT_OF_BOUNDS() : new q.ERR_OUT_OF_RANGE(
        "offset",
        `>= 0 and <= ${e}`,
        i
      );
    }
    const xe = /[^+/0-9A-Za-z-_]/g;
    function Le(i) {
      if (i = i.split("=")[0], i = i.trim().replace(xe, ""), i.length < 2) return "";
      for (; i.length % 4 !== 0; )
        i = i + "=";
      return i;
    }
    function be(i, e) {
      e = e || 1 / 0;
      let t;
      const n = i.length;
      let a = null;
      const c = [];
      for (let l = 0; l < n; ++l) {
        if (t = i.charCodeAt(l), t > 55295 && t < 57344) {
          if (!a) {
            if (t > 56319) {
              (e -= 3) > -1 && c.push(239, 191, 189);
              continue;
            } else if (l + 1 === n) {
              (e -= 3) > -1 && c.push(239, 191, 189);
              continue;
            }
            a = t;
            continue;
          }
          if (t < 56320) {
            (e -= 3) > -1 && c.push(239, 191, 189), a = t;
            continue;
          }
          t = (a - 55296 << 10 | t - 56320) + 65536;
        } else a && (e -= 3) > -1 && c.push(239, 191, 189);
        if (a = null, t < 128) {
          if ((e -= 1) < 0) break;
          c.push(t);
        } else if (t < 2048) {
          if ((e -= 2) < 0) break;
          c.push(
            t >> 6 | 192,
            t & 63 | 128
          );
        } else if (t < 65536) {
          if ((e -= 3) < 0) break;
          c.push(
            t >> 12 | 224,
            t >> 6 & 63 | 128,
            t & 63 | 128
          );
        } else if (t < 1114112) {
          if ((e -= 4) < 0) break;
          c.push(
            t >> 18 | 240,
            t >> 12 & 63 | 128,
            t >> 6 & 63 | 128,
            t & 63 | 128
          );
        } else
          throw new Error("Invalid code point");
      }
      return c;
    }
    function Me(i) {
      const e = [];
      for (let t = 0; t < i.length; ++t)
        e.push(i.charCodeAt(t) & 255);
      return e;
    }
    function $e(i, e) {
      let t, n, a;
      const c = [];
      for (let l = 0; l < i.length && !((e -= 2) < 0); ++l)
        t = i.charCodeAt(l), n = t >> 8, a = t % 256, c.push(a), c.push(n);
      return c;
    }
    function Ie(i) {
      return o.toByteArray(Le(i));
    }
    function ye(i, e, t, n) {
      let a;
      for (a = 0; a < n && !(a + t >= e.length || a >= i.length); ++a)
        e[a + t] = i[a];
      return a;
    }
    function Q(i, e) {
      return i instanceof e || i != null && i.constructor != null && i.constructor.name != null && i.constructor.name === e.name;
    }
    function we(i) {
      return i !== i;
    }
    const He = function() {
      const i = "0123456789abcdef", e = new Array(256);
      for (let t = 0; t < 16; ++t) {
        const n = t * 16;
        for (let a = 0; a < 16; ++a)
          e[n + a] = i[t] + i[a];
      }
      return e;
    }();
    function ne(i) {
      return typeof BigInt > "u" ? Ge : i;
    }
    function Ge() {
      throw new Error("BigInt not supported");
    }
  }(ve)), ve;
}
var St = vt();
const It = {}, At = (r) => {
  const o = It.gunzipSync(r.buffer);
  return new Se(o, 0);
};
typeof window < "u" && (window.Buffer = St.Buffer);
const Rt = async (r) => {
  const o = r.read(2);
  if (r.seek(0), o[0] === 31 && o[1] === 139) return At(r);
  if (r.getLength() <= le) return r;
  let u = 0;
  if (Oe(r).header !== "BZh" && (r.seek(0), r.skip(le), u = le, Oe(r).header !== "BZh"))
    return r.seek(0), r;
  const h = [];
  for (r.seek(r.getPos() - 8); r.getPos() < r.getLength(); ) {
    const m = Math.abs(r.readInt());
    h.push({
      pos: r.getPos(),
      size: m
    }), r.seek(r.getPos() + m);
  }
  const x = [r.buffer.slice(0, u)];
  let p = u;
  h.forEach((m) => {
    const E = r.buffer.slice(m.pos, m.pos + m.size), F = mt.decodeBlock(E, 32);
    p += F.length, x.push(F);
  });
  const s = new Uint8Array(p);
  let y = 0;
  return x.forEach((m) => {
    s.set(m, y), y += m.length;
  }), new Se(s, 0);
}, Oe = (r) => ({
  size: r.readInt(),
  header: r.readString(3),
  block_size: r.readString(1)
}), Ft = (r) => {
  const o = r.readString(6);
  if (o === "AR2V00" || o === "ARCHIV") {
    const u = {};
    return u.version = r.readString(2), r.skip(4), u.modified_julian_date = r.readInt(), u.milliseconds = r.readInt(), u.ICAO = r.readString(4), r.seek(0), u.raw = r.read(le), u;
  }
  return r.seek(0), {};
}, Ct = async (r, o) => {
  var $, _, b, B, v, A;
  const u = new Se(r, 0), d = [], h = await Rt(u), x = Ft(h);
  let p = 0, s = 0, y, m = {}, E = !1, F = !1;
  if (h.getPos() < h.getLength())
    do {
      try {
        y = dt(h, s, p, x, o), s += 1;
      } catch (T) {
        o.logger.warn(T), F = !0, y = { finished: !0 };
      }
      if (!y.finished) {
        if (y.message_type === 31) {
          const T = y.actual_size ?? y.message_size;
          E = !0, p += T * 2 + 12 - ze;
        }
        [1, 5, 7, 31].includes(y.message_type) && ((($ = y == null ? void 0 : y.record) != null && $.reflect || (_ = y == null ? void 0 : y.record) != null && _.velocity || (b = y == null ? void 0 : y.record) != null && b.spectrum || (B = y == null ? void 0 : y.record) != null && B.zdr || (v = y == null ? void 0 : y.record) != null && v.phi || (A = y == null ? void 0 : y.record) != null && A.rho) && d.push(y), [5, 7].includes(y.message_type) && (m = y));
      }
    } while (!y.finished);
  return {
    data: Ut(d),
    header: x,
    vcp: m,
    isTruncated: F,
    hasGaps: E
  };
}, Ut = (r) => {
  const o = [];
  return r.forEach((u) => {
    const { elevation_number: d } = u.record;
    o[d] ? o[d].push(u) : o[d] = [u];
  }), o;
}, Tt = (...r) => {
  const o = r.flat(50), u = {
    options: {},
    vcp: {},
    header: {},
    data: []
  };
  return o.forEach((d) => {
    u.elevation = d.elevation ?? u.elevation, u.hasGaps = u.hasGaps || d.hasGaps, u.isTruncated = u.isTruncated || d.isTruncated, d.options && (u.options = { ...u.options, ...d.options }), d.vcp && (u.vcp = { ...u.vcp, ...d.vcp }), d.header && (u.header = { ...u.header, ...d.header }), d.data && d.listElevations().forEach((h) => {
      u.data[h] === void 0 && (u.data[h] = []), u.data[h].push(...d.data[h]);
    });
  }), u;
};
async function kt(r, o = null) {
  if (r instanceof Uint8Array) {
    const u = Dt(o), d = await Ct(r, u);
    return new Pe({
      ...d,
      options: u
    });
  } else {
    if (r.vcp && r.options && r.elevation)
      return new Pe(r);
    throw new Error("Unknown data provided");
  }
}
class Pe {
  constructor(o) {
    this.data = o.data, this.elevation = o.elevation ?? 1, this.header = o.header, this.options = o.options, this.vcp = o.vcp, this.hasGaps = o.hasGaps, this.isTruncated = o.isTruncated;
  }
  /**
   * Sets the elevation in use for get* methods
   *
   * @param {number} elevation Selected elevation number
   * @category Configuration
   */
  setElevation(o) {
    this.elevation = o;
  }
  /**
   * Returns an single azimuth value or array of azimuth values for the current elevation and scan (or all scans if not provided).
   * The order of azimuths in the returned array matches the order of the data in other get* functions.
   *
   * @param {number} [scan] Selected scan
   * @category Data
   * @returns {number|number[]} Azimuth angle
   */
  getAzimuth(o) {
    var u, d, h, x, p, s, y, m;
    if (((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (this._checkData(), ((d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) === void 0) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);
      if (((x = (h = this == null ? void 0 : this.data) == null ? void 0 : h[this.elevation]) == null ? void 0 : x[o]) === void 0) throw new Error(`getAzimuth invalid scan selected: ${o}`);
      if (((m = (y = (s = (p = this == null ? void 0 : this.data) == null ? void 0 : p[this.elevation]) == null ? void 0 : s[o]) == null ? void 0 : y.record) == null ? void 0 : m.azimuth) === void 0) throw new Error(`getAzimuth no data for elevation: ${this.elevation}, scan: ${o}`);
      return this.data[this.elevation][o].record.azimuth;
    }
    return this.data[this.elevation].map((E) => E.record.azimuth);
  }
  /**
   * Return the number of scans in the current elevation
   *
   * @category Metadata
   * @returns {number}
   */
  getScans() {
    var o;
    if (this._checkData(), ((o = this == null ? void 0 : this.data) == null ? void 0 : o[this.elevation]) === void 0) throw new Error(`getScans no data for elevation: ${this.elevation}`);
    return this.data[this.elevation].length;
  }
  /**
   * Return message_header information for all scans or a specific scan for the selected elevation
   *
   * @category Metadata
   * @param {number} [scan] Selected scan, omit to return all scans for this elevation
   * @returns {MessageHeader}
   */
  getHeader(o) {
    var u, d, h, x, p, s;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHeader invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[o]) === void 0) throw new Error(`getHeader invalid scan selected: ${o}`);
      if (((s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[o]) == null ? void 0 : s.record) === void 0) throw new Error(`getHeader no data for elevation: ${this.elevation}, scan: ${o}`);
      return this.data[this.elevation][o].record;
    }
    return this.data[this.elevation].map((y) => y.record);
  }
  /**
   * Returns an Object of radar reflectivity data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res reflectivity data, or an array of the data.
   */
  getHighresReflectivity(o) {
    var u, d, h, x, p, s, y;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHighresReflectivity invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[o]) === void 0) throw new Error(`getHighresReflectivity invalid scan selected: ${o}`);
      if (((y = (s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[o]) == null ? void 0 : s.record) == null ? void 0 : y.reflect) === void 0) throw new Error(`getHighresReflectivity no data for elevation: ${this.elevation}, scan: ${o}`);
      return this.data[this.elevation][o].record.reflect;
    }
    return this.data[this.elevation].map((m) => m.record.reflect);
  }
  /**
   * Returns an Object of radar velocity data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan, or null for all scans in this elevation
   * @returns {HighResData|HighResData[]} Scan's high res velocity data, or an array of the data.
   */
  getHighresVelocity(o) {
    var u, d, h, x, p, s, y;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHighresVelocity invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[o]) === void 0) throw new Error(`getHighresVelocity invalid scan selected: ${o}`);
      if (((y = (s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[o]) == null ? void 0 : s.record) == null ? void 0 : y.reflect) === void 0) throw new Error(`getHighresVelocity no data for elevation: ${this.elevation}, scan: ${o}`);
      return this.data[this.elevation][o].record.velocity;
    }
    return this.data[this.elevation].map((m) => m.record.velocity);
  }
  /**
   * Returns an Object of radar spectrum data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan, or null for all scans in this elevation
   * @returns {HighResData|HighResData[]} Scan's high res spectrum data, or an array of the data.
   */
  getHighresSpectrum(o) {
    var u, d, h, x, p, s, y;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHighresSpectrum invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[o]) === void 0) throw new Error(`getHighresSpectrum invalid scan selected: ${o}`);
      if (((y = (s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[o]) == null ? void 0 : s.record) == null ? void 0 : y.spectrum) === void 0) throw new Error(`getHighresSpectrum no data for elevation: ${this.elevation}, scan: ${o}`);
      return this.data[this.elevation][o].record.spectrum;
    }
    return this.data[this.elevation].map((m) => m.record.spectrum);
  }
  /**
   * Returns an Object of radar differential reflectivity data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res differential reflectivity data, or an array of the data.
   */
  getHighresDiffReflectivity(o) {
    var u, d, h, x, p, s, y;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHighresDiffReflectivity invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[this.scan]) === void 0) throw new Error(`getHighresDiffReflectivity invalid scan selected: ${this.scan}`);
      if (((y = (s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[this.scan]) == null ? void 0 : s.record) == null ? void 0 : y.zdr) === void 0) throw new Error(`getHighresDiffReflectivity no data for elevation: ${this.elevation}, scan: ${this.scan}`);
      return this.data[this.elevation][this.scan].record.zdr;
    }
    return this.data[this.elevation].map((m) => m.record.zdr);
  }
  /**
   * Returns an Object of radar differential phase data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res differential phase data, or an array of the data.
   */
  getHighresDiffPhase(o) {
    var u, d, h, x, p, s, y;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHighresDiffPhase invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[this.scan]) === void 0) throw new Error(`getHighresDiffPhase invalid scan selected: ${this.scan}`);
      if (((y = (s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[this.scan]) == null ? void 0 : s.record) == null ? void 0 : y.phi) === void 0) throw new Error(`getHighresDiffPhase no data for elevation: ${this.elevation}, scan: ${this.scan}`);
      return this.data[this.elevation][this.scan].record.phi;
    }
    return this.data[this.elevation].map((m) => m.record.phi);
  }
  /**
   * Returns an Object of radar correlation coefficient data for the current elevation and scan (or all scans if not provided)
   *
   * @category Data
   * @param {number} [scan] Selected scan or null for all scans in elevation
   * @returns {HighResData|HighResData[]} Scan's high res correlation coefficient data, or an array of the data.
   */
  getHighresCorrelationCoefficient(o) {
    var u, d, h, x, p, s, y;
    if (this._checkData(), ((u = this == null ? void 0 : this.data) == null ? void 0 : u[this.elevation]) === void 0) throw new Error(`getHighresCorrelationCoefficient invalid elevation selected: ${this.elevation}`);
    if (o !== void 0) {
      if (((h = (d = this == null ? void 0 : this.data) == null ? void 0 : d[this.elevation]) == null ? void 0 : h[this.scan]) === void 0) throw new Error(`getHighresCorrelationCoefficient invalid scan selected: ${this.scan}`);
      if (((y = (s = (p = (x = this == null ? void 0 : this.data) == null ? void 0 : x[this.elevation]) == null ? void 0 : p[this.scan]) == null ? void 0 : s.record) == null ? void 0 : y.rho) === void 0) throw new Error(`getHighresCorrelationCoefficient no data for elevation: ${this.elevation}, scan: ${this.scan}`);
      return this.data[this.elevation][this.scan].record.rho;
    }
    return this.data[this.elevation].map((m) => m.record.rho);
  }
  /**
   * List all available elevations
   *
   * @category Metadata
   * @returns {number[]}
   */
  listElevations() {
    return Object.keys(this.data).map((o) => +o);
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
  static combineData(...o) {
    const u = Tt(o);
    return new kt(u);
  }
}
const Dt = (r) => {
  let o = (r == null ? void 0 : r.logger) ?? console;
  return o === !1 && (o = Ot), {
    ...r,
    logger: o
  };
}, Ot = {
  log: () => {
  },
  error: () => {
  },
  warn: () => {
  }
};
export {
  kt as Level2Radar
};
