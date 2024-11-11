// <auto-generated/>

#nullable disable

using System;
using System.ComponentModel;
using UnbrandedTypeSpec;

namespace UnbrandedTypeSpec.Models
{
    /// <summary> Extensible enum. </summary>
    public readonly partial struct StringExtensibleEnum : IEquatable<StringExtensibleEnum>
    {
        private readonly string _value;
        private const string OneValue = "1";
        private const string TwoValue = "2";
        private const string FourValue = "4";

        /// <summary> Initializes a new instance of <see cref="StringExtensibleEnum"/>. </summary>
        /// <param name="value"> The value. </param>
        /// <exception cref="ArgumentNullException"> <paramref name="value"/> is null. </exception>
        public StringExtensibleEnum(string value)
        {
            Argument.AssertNotNull(value, nameof(value));

            _value = value;
        }

        /// <summary> Gets the One. </summary>
        public static StringExtensibleEnum One { get; } = new StringExtensibleEnum(OneValue);

        /// <summary> Gets the Two. </summary>
        public static StringExtensibleEnum Two { get; } = new StringExtensibleEnum(TwoValue);

        /// <summary> Gets the Four. </summary>
        public static StringExtensibleEnum Four { get; } = new StringExtensibleEnum(FourValue);

        /// <summary> Determines if two <see cref="StringExtensibleEnum"/> values are the same. </summary>
        /// <param name="left"> The left value to compare. </param>
        /// <param name="right"> The right value to compare. </param>
        public static bool operator ==(StringExtensibleEnum left, StringExtensibleEnum right) => left.Equals(right);

        /// <summary> Determines if two <see cref="StringExtensibleEnum"/> values are not the same. </summary>
        /// <param name="left"> The left value to compare. </param>
        /// <param name="right"> The right value to compare. </param>
        public static bool operator !=(StringExtensibleEnum left, StringExtensibleEnum right) => !left.Equals(right);

        /// <summary> Converts a string to a <see cref="StringExtensibleEnum"/>. </summary>
        /// <param name="value"> The value. </param>
        public static implicit operator StringExtensibleEnum(string value) => new StringExtensibleEnum(value);

        /// <param name="obj"> The object to compare. </param>
        [EditorBrowsableAttribute(EditorBrowsableState.Never)]
        public override bool Equals(object obj) => ((obj is StringExtensibleEnum other) && this.Equals(other));

        /// <param name="other"> The instance to compare. </param>
        public bool Equals(StringExtensibleEnum other) => string.Equals(_value, other._value, StringComparison.InvariantCultureIgnoreCase);

        /// <inheritdoc/>
        public override int GetHashCode() => (_value != null) ? StringComparer.InvariantCultureIgnoreCase.GetHashCode(_value) : 0;

        /// <inheritdoc/>
        public override string ToString() => _value;
    }
}
