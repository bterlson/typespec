// <auto-generated/>

#nullable disable

using System.ClientModel;
using System.ClientModel.Primitives;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace _Type.Dictionary
{
    public partial class Float32Value
    {
        protected Float32Value() => throw null;

        public ClientPipeline Pipeline => throw null;

        public virtual ClientResult Get(RequestOptions options) => throw null;

        public virtual Task<ClientResult> GetAsync(RequestOptions options) => throw null;

        public virtual ClientResult<IDictionary<string, float>> Get() => throw null;

        public virtual Task<ClientResult<IDictionary<string, float>>> GetAsync() => throw null;

        public virtual ClientResult Put(BinaryContent content, RequestOptions options) => throw null;

        public virtual Task<ClientResult> PutAsync(BinaryContent content, RequestOptions options) => throw null;

        public virtual ClientResult Put(IDictionary<string, float> body) => throw null;

        public virtual Task<ClientResult> PutAsync(IDictionary<string, float> body) => throw null;
    }
}
