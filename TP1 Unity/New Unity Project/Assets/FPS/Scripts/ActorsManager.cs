using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class ActorsManager : NetworkBehaviour
{
    public List<Actor> actors { get; private set; }

    private void Awake()
    {
        actors = new List<Actor>();
    }
}
