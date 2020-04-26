using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class ConstantRotation : NetworkBehaviour
{
    [Tooltip("Rotation angle per second")]
    public float rotatingSpeed = 360f;

    void Update()
    {
        // Handle rotating
        transform.Rotate(Vector3.up, rotatingSpeed * Time.deltaTime, Space.Self);
    }
}
